import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import {
  addSampleCartItem,
  bootstrapCartSession,
  expireOrderIdempotencyKey,
  getOrderForSession,
  postCreateOrder,
  setMenuItemActive,
  setMenuOptionActive,
} from '../testHelpers.js';

test.before(async () => {
  await setupTestDatabase();
});

const { default: app } = await import('../../server.js');

test('POST /api/orders creates order from available cart and clears cart', async () => {
  const session = await bootstrapCartSession(app);
  const add = await addSampleCartItem(app, session, 'item-1', ['opt-1', 'opt-4']);
  assert.equal(add.status, 201);

  const created = await postCreateOrder(app, session, { body: {} });
  assert.equal(created.status, 201);
  assert.match(created.body.order.order_number, /^ORD-[0-9]{8}-[0-9A-F]{8}$/);
  assert.equal(created.body.order.status, 'created');
  assert.equal(created.body.order.status_label, '已建立');
  assert.equal(created.body.order.total, '220.00');
  assert.equal(created.body.order.items.length, 1);
  assert.equal(created.body.order.items[0].unit_price, '220.00');

  const cart = await request(app).get('/api/cart').set('Cookie', session.headers.Cookie);
  assert.deepEqual(cart.body.cart.items, []);
  assert.equal(cart.body.cart.total, '0.00');
});

test('POST /api/orders rejects unavailable cart items with 409', async () => {
  const session = await bootstrapCartSession(app);

  try {
    await addSampleCartItem(app, session);
    await request(app)
      .post('/api/cart/items')
      .set(session.headers)
      .send({ menu_item_id: 'item-3', quantity: 1, menu_item_option_ids: [] });
    await setMenuOptionActive(app, 'item-1', 'opt-1', false);
    const response = await postCreateOrder(app, session);
    assert.equal(response.status, 409);
    assert.equal(response.body.error.code, 'CART_HAS_UNAVAILABLE_ITEMS');
  } finally {
    await setMenuOptionActive(app, 'item-1', 'opt-1', true);
  }
});

test('POST /api/orders rejects empty cart with 400 CART_EMPTY', async () => {
  const session = await bootstrapCartSession(app);
  const response = await postCreateOrder(app, session);
  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'CART_EMPTY');
});

test('POST /api/orders rejects missing Origin and invalid CSRF without clearing cart', async () => {
  const session = await bootstrapCartSession(app);
  await addSampleCartItem(app, session);

  const missingOrigin = await request(app)
    .post('/api/orders')
    .set('Cookie', session.headers.Cookie)
    .set('X-CSRF-Token', session.csrf)
    .send({});
  assert.equal(missingOrigin.status, 403);

  const invalidOrigin = await request(app)
    .post('/api/orders')
    .set('Origin', 'https://evil.example')
    .set('Cookie', session.headers.Cookie)
    .set('X-CSRF-Token', session.csrf)
    .send({});
  assert.equal(invalidOrigin.status, 403);
  assert.equal(invalidOrigin.body.error.code, 'INVALID_ORIGIN');

  const invalidCsrf = await request(app)
    .post('/api/orders')
    .set('Origin', session.headers.Origin)
    .set('Cookie', session.headers.Cookie)
    .set('X-CSRF-Token', 'invalid-token')
    .send({});
  assert.equal(invalidCsrf.status, 403);
  assert.equal(invalidCsrf.body.error.code, 'INVALID_CSRF_TOKEN');

  const cart = await request(app).get('/api/cart').set('Cookie', session.headers.Cookie);
  assert.equal(cart.body.cart.items.length, 1);
  assert.equal(cart.body.cart.total, '220.00');
});

test('POST /api/orders rejects extra body fields with 400', async () => {
  const session = await bootstrapCartSession(app);
  await addSampleCartItem(app, session);
  const response = await postCreateOrder(app, session, { body: { total: '999.99' } });
  assert.equal(response.status, 400);
});

test('POST /api/orders ignores client amounts and persists only the cart snapshot', async () => {
  const session = await bootstrapCartSession(app);
  await addSampleCartItem(app, session);
  const response = await postCreateOrder(app, session, {
    body: { total_amount: '0.01', unit_price: '0.01', line_total: '0.01' },
  });
  assert.equal(response.status, 201);
  assert.equal(response.body.order.total, '220.00');
  assert.equal(response.body.order.items[0].unit_price, '220.00');
  assert.equal(response.body.order.items[0].line_total, '220.00');
  const persisted = await getOrderForSession(app, session, response.body.order.order_number);
  assert.equal(persisted.status, 200);
  assert.equal(persisted.body.order.total, '220.00');
  assert.equal(persisted.body.order.items[0].unit_price, '220.00');
  assert.equal(persisted.body.order.items[0].line_total, '220.00');
});

test('POST /api/orders replays idempotent requests with 200', async () => {
  const session = await bootstrapCartSession(app);
  await addSampleCartItem(app, session);
  const key = 'idem-key-001';
  const first = await postCreateOrder(app, session, { idempotencyKey: key });
  assert.equal(first.status, 201);

  await addSampleCartItem(app, session);
  const second = await postCreateOrder(app, session, { idempotencyKey: key });
  assert.equal(second.status, 200);
  assert.equal(second.body.order.order_number, first.body.order.order_number);
});

test('POST /api/orders treats an expired idempotency key as a new request', async () => {
  const session = await bootstrapCartSession(app);
  const key = 'idem-key-expired';
  await addSampleCartItem(app, session);
  const first = await postCreateOrder(app, session, { idempotencyKey: key });
  assert.equal(first.status, 201);

  await expireOrderIdempotencyKey(session.cookie, key);
  await addSampleCartItem(app, session);
  const second = await postCreateOrder(app, session, { idempotencyKey: key });

  assert.equal(second.status, 201);
  assert.notEqual(second.body.order.order_number, first.body.order.order_number);
});

test('POST /api/orders replays parallel requests with the same Idempotency-Key', async () => {
  const session = await bootstrapCartSession(app);
  await addSampleCartItem(app, session);
  const key = 'idem-key-parallel';
  const [first, second] = await Promise.all([
    postCreateOrder(app, session, { idempotencyKey: key }),
    postCreateOrder(app, session, { idempotencyKey: key }),
  ]);
  const statuses = [first.status, second.status].sort((a, b) => a - b);
  assert.deepEqual(statuses, [200, 201]);
  assert.equal(first.body.order.order_number, second.body.order.order_number);
});

test('POST /api/orders rejects at create time when cart has only unavailable items', async () => {
  const session = await bootstrapCartSession(app);
  await addSampleCartItem(app, session);
  await setMenuOptionActive(app, 'item-1', 'opt-1', false);
  try {
    const response = await postCreateOrder(app, session);
    assert.equal(response.status, 400);
    assert.equal(response.body.error.code, 'CART_EMPTY');
  } finally {
    await setMenuOptionActive(app, 'item-1', 'opt-1', true);
  }
});

test('POST /api/orders without idempotency key rejects second sequential submit', async () => {
  const session = await bootstrapCartSession(app);
  await addSampleCartItem(app, session);
  const first = await postCreateOrder(app, session);
  assert.equal(first.status, 201);
  const second = await postCreateOrder(app, session);
  assert.equal(second.status, 400);
  assert.equal(second.body.error.code, 'CART_EMPTY');
});

test('POST /api/orders without idempotency key allows only one order under parallel submit', async () => {
  const session = await bootstrapCartSession(app);
  await addSampleCartItem(app, session);
  const [first, second] = await Promise.all([
    postCreateOrder(app, session),
    postCreateOrder(app, session),
  ]);
  const successCount = [first, second].filter((response) => response.status === 201).length;
  const emptyCount = [first, second].filter(
    (response) => response.status === 400 && response.body.error.code === 'CART_EMPTY'
  ).length;
  assert.equal(successCount, 1);
  assert.equal(emptyCount, 1);
});

test('POST /api/orders does not record idempotency on failed create', async () => {
  const session = await bootstrapCartSession(app);
  const key = 'idem-key-fail';
  const failed = await postCreateOrder(app, session, { idempotencyKey: key });
  assert.equal(failed.status, 400);

  await addSampleCartItem(app, session);
  const success = await postCreateOrder(app, session, { idempotencyKey: key });
  assert.equal(success.status, 201);
});
