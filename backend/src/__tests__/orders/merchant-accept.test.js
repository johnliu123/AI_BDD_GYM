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

test('POST accept transitions created to accepted', async () => {
  const session = await bootstrapCartSession(app);
  const created = await createSampleOrder(app, session);
  const orderNumber = created.body.order.order_number;

  const accepted = await merchantPost(app, `/api/merchant/orders/${orderNumber}/accept`);
  assert.equal(accepted.status, 200);
  assert.equal(accepted.body.order.status, 'accepted');
  assert.equal(accepted.body.order.status_label, '已接單');
});

test('POST accept without token returns 401 and leaves status unchanged', async () => {
  const session = await bootstrapCartSession(app);
  const created = await createSampleOrder(app, session);
  const orderNumber = created.body.order.order_number;

  const response = await request(app)
    .post(`/api/merchant/orders/${orderNumber}/accept`)
    .send({});
  assert.equal(response.status, 401);

  const detail = await merchantPost(app, `/api/merchant/orders/${orderNumber}/accept`);
  assert.equal(detail.status, 200);
});

test('POST accept on non-created order returns 409', async () => {
  const session = await bootstrapCartSession(app);
  const created = await createSampleOrder(app, session);
  const orderNumber = created.body.order.order_number;

  await merchantPost(app, `/api/merchant/orders/${orderNumber}/accept`);
  const again = await merchantPost(app, `/api/merchant/orders/${orderNumber}/accept`);
  assert.equal(again.status, 409);
  assert.equal(again.body.error.code, 'ORDER_STATUS_CONFLICT');
});

test('POST accept ignores junk amount fields in body', async () => {
  const session = await bootstrapCartSession(app);
  const created = await createSampleOrder(app, session);
  const orderNumber = created.body.order.order_number;
  const beforeTotal = created.body.order.total;
  const beforeItems = created.body.order.items;

  const accepted = await merchantPost(app, `/api/merchant/orders/${orderNumber}/accept`, {
    body: { total: '999.99', items: [{ menu_item_name: 'fake', quantity: 99 }] },
  });
  assert.equal(accepted.status, 200);
  assert.equal(accepted.body.order.total, beforeTotal);
  assert.deepEqual(accepted.body.order.items, beforeItems);
});
