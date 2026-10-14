/**
 * 006 進階功能 smoke（memory DB）：菜單 API + E2E 精簡旅程。
 */
import assert from 'node:assert/strict';
import request from 'supertest';
import { setupTestDatabase } from '../src/test-utils/testHarness.js';
import {
  MERCHANT_TEST_TOKEN,
  addSampleCartItem,
  bootstrapCartSession,
  merchantGet,
  merchantPost,
  postCreateOrder,
  postPayOrder,
} from '../src/__tests__/testHelpers.js';

process.env.USE_MEMORY_DB = '1';
process.env.MERCHANT_TOKEN = process.env.MERCHANT_TOKEN || 'test-merchant-token';

await setupTestDatabase();
const { default: app } = await import('../src/server.js');

const categories = await merchantGet(app, '/api/merchant/categories');
assert.equal(categories.status, 200);
assert.ok(categories.body.categories.length >= 3);

const menu = await request(app).get('/api/menu-items');
assert.equal(menu.status, 200);

const session = await bootstrapCartSession(app);
await addSampleCartItem(app, session);
const created = await postCreateOrder(app, session);
const orderNumber = created.body.order.order_number;

const paid = await postPayOrder(app, session, orderNumber);
assert.equal(paid.status, 200);

const accept = await merchantPost(app, `/api/merchant/orders/${orderNumber}/accept`, {
  token: MERCHANT_TEST_TOKEN,
});
assert.equal(accept.status, 200);

const notFound = await request(app).get('/api/no-such-route-006');
assert.equal(notFound.status, 404);
assert.equal(notFound.body.error.code, 'NOT_FOUND');

console.log('smoke-006-advanced: pass');
