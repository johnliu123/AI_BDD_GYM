import test from 'node:test';
import assert from 'node:assert/strict';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import {
  bootstrapCartSession,
  createSampleOrder,
  getOrderForSession,
  merchantGet,
  merchantPost,
  MERCHANT_TEST_TOKEN,
  postCancelOrder,
  postPayOrder,
} from '../testHelpers.js';

test.before(async () => {
  await setupTestDatabase();
});

const { default: app } = await import('../../server.js');

test('merchant list includes payment fields and filters by payment_status', async () => {
  const session = await bootstrapCartSession(app);
  const created = await createSampleOrder(app, session);
  const orderNumber = created.body.order.order_number;
  await postPayOrder(app, session, orderNumber);

  const all = await merchantGet(app, '/api/merchant/orders');
  assert.equal(all.status, 200);
  const row = all.body.orders.find((entry) => entry.order_number === orderNumber);
  assert.ok(row);
  assert.equal(row.payment_status, 'paid');
  assert.equal(row.payment_status_label, '已付款');

  const paidOnly = await merchantGet(app, '/api/merchant/orders', { query: { payment_status: 'paid' } });
  assert.ok(paidOnly.body.orders.every((entry) => entry.payment_status === 'paid'));
  assert.ok(paidOnly.body.orders.some((entry) => entry.order_number === orderNumber));

  const invalid = await merchantGet(app, '/api/merchant/orders', { query: { payment_status: 'bogus' } });
  assert.equal(invalid.status, 400);
  assert.equal(invalid.body.error.code, 'INVALID_PAYMENT_STATUS_FILTER');
});

test('merchant detail payment fields match customer getOrder', async () => {
  const session = await bootstrapCartSession(app);
  const created = await createSampleOrder(app, session);
  const orderNumber = created.body.order.order_number;
  await postPayOrder(app, session, orderNumber);

  const customer = await getOrderForSession(app, session, orderNumber);
  const merchant = await merchantGet(app, `/api/merchant/orders/${orderNumber}`);
  assert.equal(merchant.status, 200);
  assert.equal(merchant.body.order.payment_status, customer.body.order.payment_status);
  assert.equal(merchant.body.order.payment_status_label, customer.body.order.payment_status_label);
  assert.equal(merchant.body.order.total, customer.body.order.total);
});

test('merchant actions on cancelled order return 409', async () => {
  const session = await bootstrapCartSession(app);
  const created = await createSampleOrder(app, session);
  const orderNumber = created.body.order.order_number;
  await postCancelOrder(app, session, orderNumber);

  for (const action of ['accept', 'start-preparing', 'complete']) {
    const response = await merchantPost(app, `/api/merchant/orders/${orderNumber}/${action}`);
    assert.equal(response.status, 409, action);
    assert.equal(response.body.error.code, 'ORDER_STATUS_CONFLICT');
  }
});

test('merchant list and detail without token return 401', async () => {
  const list = await merchantGet(app, '/api/merchant/orders', { token: '' });
  assert.equal(list.status, 401);
  assert.equal(list.body.error.code, 'MERCHANT_UNAUTHORIZED');

  const detail = await merchantGet(app, '/api/merchant/orders/ORD-20260101-00000000', { token: '' });
  assert.equal(detail.status, 401);
});

test('merchant list returns 503 when MERCHANT_TOKEN unset', async () => {
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
