import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import {
  bootstrapCartSession,
  createSampleOrder,
  merchantGet,
  merchantPost,
} from '../testHelpers.js';

test.before(async () => {
  await setupTestDatabase();
});

const { default: app } = await import('../../server.js');

async function orderThroughAccepted(app, session) {
  const created = await createSampleOrder(app, session);
  const orderNumber = created.body.order.order_number;
  await merchantPost(app, `/api/merchant/orders/${orderNumber}/accept`);
  return { created, orderNumber };
}

test('start-preparing and complete follow legal sequence', async () => {
  const session = await bootstrapCartSession(app);
  const { orderNumber } = await orderThroughAccepted(app, session);

  const preparing = await merchantPost(app, `/api/merchant/orders/${orderNumber}/start-preparing`);
  assert.equal(preparing.status, 200);
  assert.equal(preparing.body.order.status, 'preparing');

  const completed = await merchantPost(app, `/api/merchant/orders/${orderNumber}/complete`);
  assert.equal(completed.status, 200);
  assert.equal(completed.body.order.status, 'completed');
});

test('start-preparing and complete without token return 401', async () => {
  const session = await bootstrapCartSession(app);
  const created = await createSampleOrder(app, session);
  const orderNumber = created.body.order.order_number;

  const prep = await request(app).post(`/api/merchant/orders/${orderNumber}/start-preparing`).send({});
  assert.equal(prep.status, 401);

  const complete = await request(app).post(`/api/merchant/orders/${orderNumber}/complete`).send({});
  assert.equal(complete.status, 401);
});

test('skip or reverse transitions return 409', async () => {
  const session = await bootstrapCartSession(app);
  const created = await createSampleOrder(app, session);
  const orderNumber = created.body.order.order_number;

  const skip = await merchantPost(app, `/api/merchant/orders/${orderNumber}/start-preparing`);
  assert.equal(skip.status, 409);

  await merchantPost(app, `/api/merchant/orders/${orderNumber}/accept`);
  await merchantPost(app, `/api/merchant/orders/${orderNumber}/start-preparing`);
  const reverse = await merchantPost(app, `/api/merchant/orders/${orderNumber}/accept`);
  assert.equal(reverse.status, 409);
});

test('transition actions ignore junk amount body', async () => {
  const session = await bootstrapCartSession(app);
  const { created, orderNumber } = await orderThroughAccepted(app, session);
  const snapshotTotal = created.body.order.total;
  const snapshotItems = created.body.order.items;

  const preparing = await merchantPost(app, `/api/merchant/orders/${orderNumber}/start-preparing`, {
    body: {
      total: '0.01',
      total_amount: '0.01',
      unit_price: '0.01',
      line_total: '0.01',
      items: [{ unit_price: '0.01', line_total: '0.01' }],
    },
  });
  assert.equal(preparing.status, 200);
  assert.equal(preparing.body.order.status, 'preparing');
  assert.equal(preparing.body.order.total, snapshotTotal);
  assert.deepEqual(preparing.body.order.items, snapshotItems);

  const completed = await merchantPost(app, `/api/merchant/orders/${orderNumber}/complete`, {
    body: {
      total: '0.01',
      total_amount: '0.01',
      unit_price: '0.01',
      line_total: '0.01',
      items: [{ unit_price: '0.01', line_total: '0.01' }],
    },
  });
  assert.equal(completed.status, 200);
  assert.equal(completed.body.order.status, 'completed');
  assert.equal(completed.body.order.total, snapshotTotal);
  assert.deepEqual(completed.body.order.items, snapshotItems);
});

test('transition actions reject unrelated body fields without changing order state', async () => {
  const session = await bootstrapCartSession(app);
  const { orderNumber } = await orderThroughAccepted(app, session);
  const response = await merchantPost(app, `/api/merchant/orders/${orderNumber}/start-preparing`, {
    body: { forged_role: 'admin' },
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'INVALID_REQUEST_BODY');
  const detail = await merchantGet(app, `/api/merchant/orders/${orderNumber}`);
  assert.equal(detail.body.order.status, 'accepted');
});

test('double complete returns 409', async () => {
  const session = await bootstrapCartSession(app);
  const { orderNumber } = await orderThroughAccepted(app, session);
  await merchantPost(app, `/api/merchant/orders/${orderNumber}/start-preparing`);

  const first = await merchantPost(app, `/api/merchant/orders/${orderNumber}/complete`);
  assert.equal(first.status, 200);

  const second = await merchantPost(app, `/api/merchant/orders/${orderNumber}/complete`);
  assert.equal(second.status, 409);
});
