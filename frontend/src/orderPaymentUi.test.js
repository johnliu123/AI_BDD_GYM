import test from 'node:test';
import assert from 'node:assert/strict';
import { canCancelOrder, canPayOrder, isPaymentPendingStale } from './orderPaymentUi.js';

test('canPayOrder allows unpaid and stale pending', () => {
  assert.equal(canPayOrder({ status: 'created', payment_status: 'unpaid' }), true);
  const stalePending = {
    status: 'created',
    payment_status: 'pending',
    payment_status_updated_at: new Date(Date.now() - 130_000).toISOString(),
  };
  assert.equal(canPayOrder(stalePending), true);
  assert.equal(
    canPayOrder({
      status: 'created',
      payment_status: 'pending',
      payment_status_updated_at: new Date().toISOString(),
    }),
    false
  );
});

test('canCancelOrder blocks fresh pending only', () => {
  assert.equal(canCancelOrder({ status: 'created', payment_status: 'unpaid' }), true);
  assert.equal(
    canCancelOrder({
      status: 'created',
      payment_status: 'pending',
      payment_status_updated_at: new Date().toISOString(),
    }),
    false
  );
  assert.equal(isPaymentPendingStale(new Date(Date.now() - 130_000).toISOString()), true);
});
