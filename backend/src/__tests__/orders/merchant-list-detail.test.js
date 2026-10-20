import test from 'node:test';
import assert from 'node:assert/strict';
import { insertOrderHeader } from '../../repositories/orderRepository.js';
import { createSessionRecord } from '../../repositories/guestSessionRepository.js';
import { getPool } from '../../config/db.js';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import {
  bootstrapCartSession,
  createSampleOrder,
  merchantGet,
  merchantPost,
  MERCHANT_TEST_TOKEN,
} from '../testHelpers.js';

test.before(async () => {
  await setupTestDatabase();
});

const { default: app } = await import('../../server.js');

test('GET /api/merchant/orders lists created orders with valid token', async () => {
  const session = await bootstrapCartSession(app);
  const created = await createSampleOrder(app, session);
  assert.equal(created.status, 201);

  const list = await merchantGet(app, '/api/merchant/orders');
  assert.equal(list.status, 200);
  assert.ok(list.body.orders.some((row) => row.order_number === created.body.order.order_number));
  assert.equal(list.body.orders[0].status_label, '已建立');
});

test('GET /api/merchant/orders returns no more than 200 orders', async () => {
  const session = await createSessionRecord();
  const pool = getPool();
  for (let index = 0; index < 201; index += 1) {
    const suffix = String(index).padStart(8, '0');
    await insertOrderHeader(session.id, `ORD-20261020-${suffix}`, '10.00', pool);
  }

  const response = await merchantGet(app, '/api/merchant/orders');
  assert.equal(response.status, 200);
  assert.equal(response.body.orders.length, 200);
});

test('GET /api/merchant/orders filters by valid status', async () => {
  const session = await bootstrapCartSession(app);
  const created = await createSampleOrder(app, session);
  const orderNumber = created.body.order.order_number;

  const accept = await merchantPost(app, `/api/merchant/orders/${orderNumber}/accept`);
  assert.equal(accept.status, 200);

  const filtered = await merchantGet(app, '/api/merchant/orders', { query: { status: 'accepted' } });
  assert.equal(filtered.status, 200);
  assert.ok(filtered.body.orders.every((row) => row.status === 'accepted'));
});

test('GET /api/merchant/orders rejects invalid status filter with 400', async () => {
  const response = await merchantGet(app, '/api/merchant/orders', { query: { status: 'shipped' } });
  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'INVALID_STATUS_FILTER');
});

test('GET /api/merchant/orders/:order_number returns snapshot detail', async () => {
  const session = await bootstrapCartSession(app);
  const created = await createSampleOrder(app, session);
  const orderNumber = created.body.order.order_number;

  const detail = await merchantGet(app, `/api/merchant/orders/${orderNumber}`);
  assert.equal(detail.status, 200);
  assert.equal(detail.body.order.total, '220.00');
  assert.equal(detail.body.order.items.length, 1);
  assert.equal(detail.body.order.items[0].unit_price, '220.00');
});

test('merchant list and detail without token return 401', async () => {
  const list = await merchantGet(app, '/api/merchant/orders', { token: '' });
  assert.equal(list.status, 401);
  assert.equal(list.body.error.code, 'MERCHANT_UNAUTHORIZED');

  const detail = await merchantGet(app, '/api/merchant/orders/ORD-20260101-00000000', { token: 'wrong' });
  assert.equal(detail.status, 401);
});

test('GET /api/merchant/orders returns 503 when MERCHANT_TOKEN is unset', async () => {
  const savedToken = process.env.MERCHANT_TOKEN;
  const savedCredentials = process.env.MERCHANT_CREDENTIALS;
  delete process.env.MERCHANT_TOKEN;
  delete process.env.MERCHANT_CREDENTIALS;
  try {
    const response = await merchantGet(app, '/api/merchant/orders', { token: MERCHANT_TEST_TOKEN });
    assert.equal(response.status, 503);
    assert.equal(response.body.error.code, 'MERCHANT_NOT_CONFIGURED');
  } finally {
    process.env.MERCHANT_TOKEN = savedToken;
    process.env.MERCHANT_CREDENTIALS = savedCredentials;
  }
});

test('GET /api/merchant/orders/:order_number returns 404 for missing order', async () => {
  const response = await merchantGet(app, '/api/merchant/orders/ORD-20260101-00000000');
  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, 'ORDER_NOT_FOUND');
});
