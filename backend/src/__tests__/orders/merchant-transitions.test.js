import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import {
  bootstrapCartSession,
  createSampleOrder,
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

  const preparing = await merchantPost(app, `/api/merchant/orders/${orderNumber}/start-preparing`, {
    body: { total: '0.01' },
  });
  assert.equal(preparing.status, 200);
  assert.equal(preparing.body.order.total, snapshotTotal);

  const completed = await merchantPost(app, `/api/merchant/orders/${orderNumber}/complete`, {
    body: { total: '0.01' },
  });
  assert.equal(completed.status, 200);
  assert.equal(completed.body.order.total, snapshotTotal);
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
