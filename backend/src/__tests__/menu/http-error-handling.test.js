import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import { bootstrapCartSession, createSampleOrder, merchantPost } from '../testHelpers.js';

process.env.ENABLE_HTTP_ERROR_TEST_ROUTES = '1';

test.before(async () => {
  await setupTestDatabase();
});

const { default: app } = await import('../../server.js');

test('unknown route returns 404 NOT_FOUND JSON', async () => {
  const response = await request(app).get('/api/no-such-route');
  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, 'NOT_FOUND');
});

test('invalid JSON body returns 400 INVALID_REQUEST_BODY', async () => {
  const response = await request(app)
    .post('/api/merchant/categories')
    .set('Content-Type', 'application/json')
    .set('X-Merchant-Token', 'test-merchant-token')
    .send('{');
  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'INVALID_REQUEST_BODY');
});

test('internal error returns 500 without stack in body', async () => {
  const response = await request(app).get('/api/_test/internal-error');
  assert.equal(response.status, 500);
  assert.equal(response.body.error.code, 'INTERNAL_ERROR');
  assert.equal(response.body.error.stack, undefined);
});

test('ORDER_STATUS_CONFLICT still returned for illegal transition', async () => {
  const session = await bootstrapCartSession(app);
  const created = await createSampleOrder(app, session);
  const orderNumber = created.body.order.order_number;
  await merchantPost(app, `/api/merchant/orders/${orderNumber}/accept`);
  const again = await merchantPost(app, `/api/merchant/orders/${orderNumber}/accept`);
  assert.equal(again.status, 409);
  assert.equal(again.body.error.code, 'ORDER_STATUS_CONFLICT');
});
