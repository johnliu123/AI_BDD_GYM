import test from 'node:test';
import assert from 'node:assert/strict';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import {
  addSampleCartItem,
  bootstrapCartSession,
  countPaymentIdempotencyKeys,
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
  return { session, orderNumber: created.body.order.order_number };
}

test('simulate failure sets failed without idempotency row', async () => {
  const prevNode = process.env.NODE_ENV;
  const prevAllow = process.env.ALLOW_PAYMENT_SIMULATE_BODY;
  process.env.NODE_ENV = 'development';
  process.env.ALLOW_PAYMENT_SIMULATE_BODY = 'true';
  try {
    const { session, orderNumber } = await createUnpaidOrder();
    const before = await countPaymentIdempotencyKeys();

    const failed = await postPayOrder(app, session, orderNumber, {
      body: { simulate_outcome: 'failure' },
    });
    assert.equal(failed.status, 200);
    assert.equal(failed.body.order.payment_status, 'failed');
    assert.ok(failed.body.order.payment_failure_reason);

    const after = await countPaymentIdempotencyKeys();
    assert.equal(after, before);
  } finally {
    if (prevNode === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = prevNode;
    }
    if (prevAllow === undefined) {
      delete process.env.ALLOW_PAYMENT_SIMULATE_BODY;
    } else {
      process.env.ALLOW_PAYMENT_SIMULATE_BODY = prevAllow;
    }
  }
});

test('failed order can pay again to paid', async () => {
  const prevNode = process.env.NODE_ENV;
  const prevAllow = process.env.ALLOW_PAYMENT_SIMULATE_BODY;
  process.env.NODE_ENV = 'development';
  process.env.ALLOW_PAYMENT_SIMULATE_BODY = 'true';
  try {
    const { session, orderNumber } = await createUnpaidOrder();
    await postPayOrder(app, session, orderNumber, { body: { simulate_outcome: 'failure' } });
    const paid = await postPayOrder(app, session, orderNumber);
    assert.equal(paid.status, 200);
    assert.equal(paid.body.order.payment_status, 'paid');
  } finally {
    if (prevNode === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = prevNode;
    }
    if (prevAllow === undefined) {
      delete process.env.ALLOW_PAYMENT_SIMULATE_BODY;
    } else {
      process.env.ALLOW_PAYMENT_SIMULATE_BODY = prevAllow;
    }
  }
});

test('Idempotency-Key replays paid result without duplicate keys', async () => {
  const { session, orderNumber } = await createUnpaidOrder();
  const key = 'pay-idem-key-001';

  const first = await postPayOrder(app, session, orderNumber, { idempotencyKey: key });
  assert.equal(first.status, 200);
  assert.equal(first.body.order.payment_status, 'paid');
  assert.equal(await countPaymentIdempotencyKeys(), 1);

  const replay = await postPayOrder(app, session, orderNumber, { idempotencyKey: key });
  assert.equal(replay.status, 200);
  assert.equal(replay.body.order.order_number, orderNumber);
  assert.equal(replay.body.order.payment_status, 'paid');
  assert.equal(await countPaymentIdempotencyKeys(), 1);
});

test('Idempotency-Key on different order_number returns 409 IDEMPOTENCY_KEY_ORDER_MISMATCH', async () => {
  const session = await bootstrapCartSession(app);
  await addSampleCartItem(app, session);
  const createdA = await postCreateOrder(app, session);
  const orderA = createdA.body.order.order_number;
  await addSampleCartItem(app, session);
  const createdB = await postCreateOrder(app, session);
  const orderB = createdB.body.order.order_number;
  assert.notEqual(orderA, orderB);

  const key = 'pay-idem-cross-order';

  const first = await postPayOrder(app, session, orderA, { idempotencyKey: key });
  assert.equal(first.status, 200);
  assert.equal(first.body.order.payment_status, 'paid');

  const mismatch = await postPayOrder(app, session, orderB, { idempotencyKey: key });
  assert.equal(mismatch.status, 409);
  assert.equal(mismatch.body.error.code, 'IDEMPOTENCY_KEY_ORDER_MISMATCH');

  const orderBState = await postPayOrder(app, session, orderB);
  assert.equal(orderBState.status, 200);
  assert.equal(orderBState.body.order.payment_status, 'paid');
});

test('parallel pay with same Idempotency-Key on same order both succeed with one idempotency row', async () => {
  const { session, orderNumber } = await createUnpaidOrder();
  const key = 'pay-idem-parallel-same-order';
  const before = await countPaymentIdempotencyKeys();

  const [first, second] = await Promise.all([
    postPayOrder(app, session, orderNumber, { idempotencyKey: key }),
    postPayOrder(app, session, orderNumber, { idempotencyKey: key }),
  ]);

  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(first.body.order.order_number, orderNumber);
  assert.equal(second.body.order.order_number, orderNumber);
  assert.equal(first.body.order.payment_status, 'paid');
  assert.equal(second.body.order.payment_status, 'paid');
  assert.equal(await countPaymentIdempotencyKeys(), before + 1);
});

test('5xx after pending leaves no idempotency row and allows retry', async () => {
  const prevAbort = process.env.PAYMENT_TEST_ABORT_AFTER_PENDING;
  process.env.PAYMENT_TEST_ABORT_AFTER_PENDING = '1';
  try {
    const { session, orderNumber } = await createUnpaidOrder();
    const before = await countPaymentIdempotencyKeys();

    const aborted = await postPayOrder(app, session, orderNumber, { idempotencyKey: 'retry-key-1' });
    assert.equal(aborted.status, 500);
    assert.equal(await countPaymentIdempotencyKeys(), before);

    delete process.env.PAYMENT_TEST_ABORT_AFTER_PENDING;
    const retry = await postPayOrder(app, session, orderNumber, { idempotencyKey: 'retry-key-1' });
    assert.equal(retry.status, 200);
    assert.equal(retry.body.order.payment_status, 'paid');
    assert.equal(await countPaymentIdempotencyKeys(), before + 1);
  } finally {
    if (prevAbort === undefined) {
      delete process.env.PAYMENT_TEST_ABORT_AFTER_PENDING;
    } else {
      process.env.PAYMENT_TEST_ABORT_AFTER_PENDING = prevAbort;
    }
  }
});
