import test from 'node:test';
import assert from 'node:assert/strict';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import {
  bootstrapCartSession,
  createSampleOrder,
  getOrderForSession,
  merchantPost,
} from '../testHelpers.js';

test.before(async () => {
  await setupTestDatabase();
});

const { default: app } = await import('../../server.js');

test('customer getOrder reflects merchant workflow with unchanged total', async () => {
  const session = await bootstrapCartSession(app);
  const created = await createSampleOrder(app, session);
  const orderNumber = created.body.order.order_number;
  const total = created.body.order.total;

  const steps = [
    { action: null, status: 'created', label: '已建立' },
    { action: 'accept', status: 'accepted', label: '已接單' },
    { action: 'start-preparing', status: 'preparing', label: '出餐中' },
    { action: 'complete', status: 'completed', label: '已完成' },
  ];

  for (const step of steps) {
    if (step.action) {
      const path =
        step.action === 'accept'
          ? `/api/merchant/orders/${orderNumber}/accept`
          : `/api/merchant/orders/${orderNumber}/${step.action}`;
      const updated = await merchantPost(app, path);
      assert.equal(updated.status, 200);
    }

    const customer = await getOrderForSession(app, session, orderNumber);
    assert.equal(customer.status, 200);
    assert.equal(customer.body.order.status, step.status);
    assert.equal(customer.body.order.status_label, step.label);
    assert.equal(customer.body.order.total, total);
  }
});

test('completed order remains visible to owning session', async () => {
  const session = await bootstrapCartSession(app);
  const created = await createSampleOrder(app, session);
  const orderNumber = created.body.order.order_number;

  await merchantPost(app, `/api/merchant/orders/${orderNumber}/accept`);
  await merchantPost(app, `/api/merchant/orders/${orderNumber}/start-preparing`);
  await merchantPost(app, `/api/merchant/orders/${orderNumber}/complete`);

  const customer = await getOrderForSession(app, session, orderNumber);
  assert.equal(customer.status, 200);
  assert.equal(customer.body.order.status, 'completed');
});

test('other session cannot query order by number', async () => {
  const sessionA = await bootstrapCartSession(app);
  const created = await createSampleOrder(app, sessionA);
  const orderNumber = created.body.order.order_number;

  const sessionB = await bootstrapCartSession(app);
  const foreign = await getOrderForSession(app, sessionB, orderNumber);
  assert.equal(foreign.status, 404);
  assert.equal(foreign.body.error.code, 'ORDER_NOT_FOUND');
});
