import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import {
  addSampleCartItem,
  bootstrapCartSession,
  merchantPost,
  postCreateOrder,
  postPayOrder,
  setMenuItemActive,
} from '../testHelpers.js';

test.before(async () => {
  await setupTestDatabase();
});

const { default: app } = await import('../../server.js');

test('browse → cart → order → pay → accept → complete', async () => {
  const menu = await request(app).get('/api/menu-items');
  assert.ok(menu.body.items.length > 0);

  const session = await bootstrapCartSession(app);
  await addSampleCartItem(app, session);
  const created = await postCreateOrder(app, session, { body: {} });
  assert.equal(created.status, 201);
  const orderNumber = created.body.order.order_number;
  const total = created.body.order.total;

  const pay = await postPayOrder(app, session, orderNumber);
  assert.equal(pay.status, 200);
  assert.equal(pay.body.order.total, total);

  const accept = await merchantPost(app, `/api/merchant/orders/${orderNumber}/accept`);
  assert.equal(accept.status, 200);
  const preparing = await merchantPost(app, `/api/merchant/orders/${orderNumber}/start-preparing`);
  assert.equal(preparing.status, 200);
  const complete = await merchantPost(app, `/api/merchant/orders/${orderNumber}/complete`);
  assert.equal(complete.status, 200);
  assert.equal(complete.body.order.status, 'completed');
});

test('idempotent create order replays same order number', async () => {
  const session = await bootstrapCartSession(app);
  await addSampleCartItem(app, session);
  const key = 'e2e-idem';
  const first = await postCreateOrder(app, session, { idempotencyKey: key });
  await addSampleCartItem(app, session);
  const second = await postCreateOrder(app, session, { idempotencyKey: key });
  assert.equal(second.status, 200);
  assert.equal(second.body.order.order_number, first.body.order.order_number);
});

test('create order ignores tampered total_amount in body', async () => {
  const session = await bootstrapCartSession(app);
  await addSampleCartItem(app, session);
  const created = await postCreateOrder(app, session, { body: { total_amount: '0.01' } });
  assert.equal(created.status, 201);
  assert.equal(created.body.order.total, '220.00');
});

test('pay ignores tampered total_amount in body', async () => {
  const session = await bootstrapCartSession(app);
  await addSampleCartItem(app, session);
  const created = await postCreateOrder(app, session);
  const orderNumber = created.body.order.order_number;
  const pay = await postPayOrder(app, session, orderNumber, { body: { total_amount: '0.01' } });
  assert.equal(pay.status, 200);
  assert.equal(pay.body.order.total, '220.00');
});

test('sold-out item blocks order create', async () => {
  const session = await bootstrapCartSession(app);
  await addSampleCartItem(app, session, 'item-3', []);
  await setMenuItemActive(app, 'item-3', false);
  try {
    const created = await postCreateOrder(app, session);
    assert.equal(created.status, 400);
    assert.equal(created.body.error.code, 'CART_EMPTY');
  } finally {
    await setMenuItemActive(app, 'item-3', true);
  }
});
