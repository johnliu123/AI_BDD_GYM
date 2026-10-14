import test from 'node:test';
import assert from 'node:assert/strict';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import {
  addSampleCartItem,
  bootstrapCartSession,
  forceOrderPaymentStatus,
  getOrderForSession,
  postCreateOrder,
  postPayOrder,
} from '../testHelpers.js';

test.before(async () => {
  await setupTestDatabase();
});

const { default: app } = await import('../../server.js');

async function createUnpaidOrder() {
  const session = await bootstrapCartSession(app);
  await addSampleCartItem(app, session);
  const created = await postCreateOrder(app, session);
  assert.equal(created.status, 201);
  return { session, orderNumber: created.body.order.order_number, snapshotTotal: created.body.order.total };
}

test('POST pay succeeds with paid status and snapshot total unchanged', async () => {
  const { session, orderNumber, snapshotTotal } = await createUnpaidOrder();

  const paid = await postPayOrder(app, session, orderNumber);
  assert.equal(paid.status, 200);
  assert.equal(paid.body.order.payment_status, 'paid');
  assert.equal(paid.body.order.total, snapshotTotal);

  const fetched = await getOrderForSession(app, session, orderNumber);
  assert.equal(fetched.body.order.payment_status, 'paid');
  assert.equal(fetched.body.order.total, snapshotTotal);
});

test('POST pay ignores tampered total_amount in body', async () => {
  const { session, orderNumber, snapshotTotal } = await createUnpaidOrder();

  const attempt = await postPayOrder(app, session, orderNumber, { body: { total_amount: '0.01' } });
  assert.equal(attempt.status, 200);
  assert.equal(attempt.body.order.total, snapshotTotal);

  const fetched = await getOrderForSession(app, session, orderNumber);
  assert.equal(fetched.body.order.payment_status, 'paid');
  assert.equal(fetched.body.order.total, snapshotTotal);
});

test('POST pay returns 409 ORDER_ALREADY_PAID when already paid', async () => {
  const { session, orderNumber } = await createUnpaidOrder();
  const first = await postPayOrder(app, session, orderNumber);
  assert.equal(first.status, 200);

  const second = await postPayOrder(app, session, orderNumber);
  assert.equal(second.status, 409);
  assert.equal(second.body.error.code, 'ORDER_ALREADY_PAID');
});

test('POST pay returns 409 PAYMENT_IN_PROGRESS for fresh pending', async () => {
  const { session, orderNumber } = await createUnpaidOrder();
  const freshAt = new Date().toISOString();
  await forceOrderPaymentStatus(orderNumber, session.cookie, 'pending', freshAt);

  const attempt = await postPayOrder(app, session, orderNumber);
  assert.equal(attempt.status, 409);
  assert.equal(attempt.body.error.code, 'PAYMENT_IN_PROGRESS');
});

test('POST pay succeeds when pending is stale', async () => {
  const { session, orderNumber } = await createUnpaidOrder();
  const staleAt = new Date(Date.now() - 130_000).toISOString();
  await forceOrderPaymentStatus(orderNumber, session.cookie, 'pending', staleAt);

  const paid = await postPayOrder(app, session, orderNumber);
  assert.equal(paid.status, 200);
  assert.equal(paid.body.order.payment_status, 'paid');
});

test('POST pay returns 404 for wrong session', async () => {
  const { orderNumber } = await createUnpaidOrder();
  const other = await bootstrapCartSession(app);

  const attempt = await postPayOrder(app, other, orderNumber);
  assert.equal(attempt.status, 404);
  assert.equal(attempt.body.error.code, 'ORDER_NOT_FOUND');
});
