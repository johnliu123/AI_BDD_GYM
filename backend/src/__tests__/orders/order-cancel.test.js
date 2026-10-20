import test from 'node:test';
import assert from 'node:assert/strict';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import {
  addSampleCartItem,
  bootstrapCartSession,
  forceOrderPaymentStatus,
  getOrderForSession,
  merchantPost,
  postCancelOrder,
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
  return {
    session,
    orderNumber: created.body.order.order_number,
    snapshotTotal: created.body.order.total,
  };
}

test('POST cancel succeeds for created unpaid order', async () => {
  const { session, orderNumber, snapshotTotal } = await createUnpaidOrder();

  const cancelled = await postCancelOrder(app, session, orderNumber);
  assert.equal(cancelled.status, 200);
  assert.equal(cancelled.body.order.status, 'cancelled');
  assert.equal(cancelled.body.order.payment_status, 'unpaid');
  assert.equal(cancelled.body.order.total, snapshotTotal);
});

test('POST cancel preserves failed payment status', async () => {
  const { session, orderNumber } = await createUnpaidOrder();
  await forceOrderPaymentStatus(orderNumber, session.cookie, 'failed', new Date().toISOString());

  const cancelled = await postCancelOrder(app, session, orderNumber);
  assert.equal(cancelled.status, 200);
  assert.equal(cancelled.body.order.status, 'cancelled');
  assert.equal(cancelled.body.order.payment_status, 'failed');
});

test('POST cancel returns 409 ORDER_NOT_CANCELLABLE after accept', async () => {
  const { session, orderNumber } = await createUnpaidOrder();
  const accept = await merchantPost(app, `/api/merchant/orders/${orderNumber}/accept`);
  assert.equal(accept.status, 200);

  const attempt = await postCancelOrder(app, session, orderNumber);
  assert.equal(attempt.status, 409);
  assert.equal(attempt.body.error.code, 'ORDER_NOT_CANCELLABLE');
});

test('POST cancel returns 409 PAYMENT_IN_PROGRESS for fresh pending', async () => {
  const { session, orderNumber } = await createUnpaidOrder();
  await forceOrderPaymentStatus(orderNumber, session.cookie, 'pending', new Date().toISOString());

  const attempt = await postCancelOrder(app, session, orderNumber);
  assert.equal(attempt.status, 409);
  assert.equal(attempt.body.error.code, 'PAYMENT_IN_PROGRESS');
});

test('POST cancel stale pending aborts to failed then cancelled', async () => {
  const { session, orderNumber } = await createUnpaidOrder();
  const staleAt = new Date(Date.now() - 130_000).toISOString();
  await forceOrderPaymentStatus(orderNumber, session.cookie, 'pending', staleAt);

  const cancelled = await postCancelOrder(app, session, orderNumber);
  assert.equal(cancelled.status, 200);
  assert.equal(cancelled.body.order.status, 'cancelled');
  assert.equal(cancelled.body.order.payment_status, 'failed');
  assert.notEqual(cancelled.body.order.payment_status, 'pending');
});

test('POST cancel paid order sets refunded and refunded_at', async () => {
  const { session, orderNumber } = await createUnpaidOrder();
  const paid = await postPayOrder(app, session, orderNumber);
  assert.equal(paid.status, 200);

  const cancelled = await postCancelOrder(app, session, orderNumber);
  assert.equal(cancelled.status, 200);
  assert.equal(cancelled.body.order.status, 'cancelled');
  assert.equal(cancelled.body.order.payment_status, 'refunded');
  assert.ok(cancelled.body.order.refunded_at);
});

test('POST pay returns 409 ORDER_CANCELLED after cancel', async () => {
  const { session, orderNumber } = await createUnpaidOrder();
  await postCancelOrder(app, session, orderNumber);

  const attempt = await postPayOrder(app, session, orderNumber);
  assert.equal(attempt.status, 409);
  assert.equal(attempt.body.error.code, 'ORDER_CANCELLED');
});

test('POST cancel returns 404 for an order owned by another session', async () => {
  const { orderNumber } = await createUnpaidOrder();
  const foreignSession = await bootstrapCartSession(app);

  const attempt = await postCancelOrder(app, foreignSession, orderNumber);
  assert.equal(attempt.status, 404);
  assert.equal(attempt.body.error.code, 'ORDER_NOT_FOUND');
});

test('POST cancel rejects a second cancellation without changing the snapshot', async () => {
  const { session, orderNumber, snapshotTotal } = await createUnpaidOrder();
  const first = await postCancelOrder(app, session, orderNumber);
  const cancelledAt = first.body.order.cancelled_at;
  assert.equal(first.status, 200);

  const second = await postCancelOrder(app, session, orderNumber);
  assert.equal(second.status, 409);
  assert.equal(second.body.error.code, 'ORDER_CANCELLED');
  const current = await getOrderForSession(app, session, orderNumber);
  assert.equal(current.body.order.cancelled_at, cancelledAt);
  assert.equal(current.body.order.total, snapshotTotal);
  assert.equal(current.body.order.items.length, 1);
});

test('cancel preserves line snapshot total', async () => {
  const { session, orderNumber, snapshotTotal } = await createUnpaidOrder();
  await postCancelOrder(app, session, orderNumber);

  const fetched = await getOrderForSession(app, session, orderNumber);
  assert.equal(fetched.body.order.total, snapshotTotal);
  assert.equal(fetched.body.order.items.length, 1);
});
