import test from 'node:test';
import assert from 'node:assert/strict';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import {
  addSampleCartItem,
  bootstrapCartSession,
  countPaymentIdempotencyKeys,
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

test('POST pay ignores client amounts and preserves the paid order snapshot', async () => {
  const { session, orderNumber, snapshotTotal } = await createUnpaidOrder();

  const attempt = await postPayOrder(app, session, orderNumber, {
    body: {
      total_amount: '0.01',
      unit_price: '0.01',
      line_total: '0.01',
      items: [{ menu_item_id: 'fake', menu_item_name: '偽造餐點', quantity: 99, line_total: '0.01' }],
    },
  });
  assert.equal(attempt.status, 200);
  assert.equal(attempt.body.order.payment_status, 'paid');
  assert.equal(attempt.body.order.total, snapshotTotal);
  assert.equal(attempt.body.order.items[0].unit_price, '220.00');
  assert.equal(attempt.body.order.items[0].line_total, '220.00');

  const fetched = await getOrderForSession(app, session, orderNumber);
  assert.equal(fetched.body.order.payment_status, 'paid');
  assert.equal(fetched.body.order.total, snapshotTotal);
  assert.equal(fetched.body.order.items[0].unit_price, '220.00');
  assert.equal(fetched.body.order.items[0].line_total, '220.00');
});

for (const [field, value] of [['currency', 'USD'], ['order_id', 'different-order']]) {
  test(`POST pay rejects unknown ${field} without invoking payment or changing the order`, async () => {
    const { session, orderNumber } = await createUnpaidOrder();
    const before = await getOrderForSession(app, session, orderNumber);
    const mappingCount = await countPaymentIdempotencyKeys();
    const previousAllow = process.env.ALLOW_PAYMENT_SIMULATE_BODY;
    process.env.ALLOW_PAYMENT_SIMULATE_BODY = 'true';

    let attempt;
    try {
      attempt = await postPayOrder(app, session, orderNumber, {
        idempotencyKey: `rejected-${field}-${orderNumber}`,
        body: { simulate_outcome: 'failure', [field]: value },
      });
    } finally {
      if (previousAllow === undefined) delete process.env.ALLOW_PAYMENT_SIMULATE_BODY;
      else process.env.ALLOW_PAYMENT_SIMULATE_BODY = previousAllow;
    }

    assert.equal(attempt.status, 400);
    assert.equal(attempt.body.error.code, 'INVALID_REQUEST_BODY');

    const after = await getOrderForSession(app, session, orderNumber);
    assert.equal(after.body.order.payment_status, 'unpaid');
    assert.equal(after.body.order.total, before.body.order.total);
    assert.deepEqual(after.body.order.items, before.body.order.items);
    assert.equal(await countPaymentIdempotencyKeys(), mappingCount);
  });
}

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
