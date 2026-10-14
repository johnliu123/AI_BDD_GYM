import test from 'node:test';
import assert from 'node:assert/strict';
import { isPaymentPendingStale, paymentStatusLabelFor } from '../../lib/paymentStatus.js';
import { resolvePaymentOutcome } from '../../services/paymentStub.js';

test('paymentStatusLabelFor maps known statuses', () => {
  assert.equal(paymentStatusLabelFor('unpaid'), '未付款');
  assert.equal(paymentStatusLabelFor('paid'), '已付款');
});

test('isPaymentPendingStale respects PAYMENT_PENDING_STALE_SEC', () => {
  const prev = process.env.PAYMENT_PENDING_STALE_SEC;
  process.env.PAYMENT_PENDING_STALE_SEC = '60';
  try {
    const now = Date.parse('2026-10-14T12:00:00.000Z');
    const fresh = '2026-10-14T11:59:30.000Z';
    const stale = '2026-10-14T11:58:00.000Z';
    assert.equal(isPaymentPendingStale(fresh, now), false);
    assert.equal(isPaymentPendingStale(stale, now), true);
  } finally {
    if (prev === undefined) {
      delete process.env.PAYMENT_PENDING_STALE_SEC;
    } else {
      process.env.PAYMENT_PENDING_STALE_SEC = prev;
    }
  }
});

test('resolvePaymentOutcome uses env default when body simulate disabled', () => {
  const prevOutcome = process.env.PAYMENT_SIMULATE_OUTCOME;
  const prevAllow = process.env.ALLOW_PAYMENT_SIMULATE_BODY;
  process.env.PAYMENT_SIMULATE_OUTCOME = 'failure';
  delete process.env.ALLOW_PAYMENT_SIMULATE_BODY;
  try {
    assert.equal(resolvePaymentOutcome({ simulateOutcome: 'success' }), 'failure');
  } finally {
    if (prevOutcome === undefined) {
      delete process.env.PAYMENT_SIMULATE_OUTCOME;
    } else {
      process.env.PAYMENT_SIMULATE_OUTCOME = prevOutcome;
    }
    if (prevAllow === undefined) {
      delete process.env.ALLOW_PAYMENT_SIMULATE_BODY;
    } else {
      process.env.ALLOW_PAYMENT_SIMULATE_BODY = prevAllow;
    }
  }
});

test('resolvePaymentOutcome honors dev body when allowed', () => {
  const prevEnv = process.env.NODE_ENV;
  const prevAllow = process.env.ALLOW_PAYMENT_SIMULATE_BODY;
  process.env.NODE_ENV = 'development';
  process.env.ALLOW_PAYMENT_SIMULATE_BODY = 'true';
  try {
    assert.equal(resolvePaymentOutcome({ simulateOutcome: 'failure' }), 'failure');
    assert.equal(resolvePaymentOutcome({ simulateOutcome: 'success' }), 'success');
  } finally {
    if (prevEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = prevEnv;
    }
    if (prevAllow === undefined) {
      delete process.env.ALLOW_PAYMENT_SIMULATE_BODY;
    } else {
      process.env.ALLOW_PAYMENT_SIMULATE_BODY = prevAllow;
    }
  }
});
