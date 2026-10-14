import test from 'node:test';
import assert from 'node:assert/strict';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import {
  addSampleCartItem,
  bootstrapCartSession,
  getOrderForSession,
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
  return { session, orderNumber: created.body.order.order_number };
}

test('getOrder after pay includes paid labels consistent with pay response', async () => {
  const { session, orderNumber } = await createUnpaidOrder();
  const paid = await postPayOrder(app, session, orderNumber);
  assert.equal(paid.status, 200);

  const fetched = await getOrderForSession(app, session, orderNumber);
  assert.equal(fetched.status, 200);
  assert.equal(fetched.body.order.payment_status, 'paid');
  assert.equal(fetched.body.order.payment_status_label, '已付款');
  assert.equal(fetched.body.order.total, paid.body.order.total);
});

test('getOrder after failed pay includes failure reason', async () => {
  const prevNode = process.env.NODE_ENV;
  const prevAllow = process.env.ALLOW_PAYMENT_SIMULATE_BODY;
  process.env.NODE_ENV = 'development';
  process.env.ALLOW_PAYMENT_SIMULATE_BODY = 'true';
  try {
    const { session, orderNumber } = await createUnpaidOrder();
    await postPayOrder(app, session, orderNumber, { body: { simulate_outcome: 'failure' } });

    const fetched = await getOrderForSession(app, session, orderNumber);
    assert.equal(fetched.body.order.payment_status, 'failed');
    assert.ok(fetched.body.order.payment_failure_reason);
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

test('getOrder after cancel shows cancelled status label', async () => {
  const { session, orderNumber } = await createUnpaidOrder();
  await postCancelOrder(app, session, orderNumber);

  const fetched = await getOrderForSession(app, session, orderNumber);
  assert.equal(fetched.body.order.status, 'cancelled');
  assert.equal(fetched.body.order.status_label, '已取消');
});

test('getOrder returns 404 for foreign session', async () => {
  const { orderNumber } = await createUnpaidOrder();
  const other = await bootstrapCartSession(app);
  const fetched = await getOrderForSession(app, other, orderNumber);
  assert.equal(fetched.status, 404);
  assert.equal(fetched.body.error.code, 'ORDER_NOT_FOUND');
});
