/**
 * 005 付款／取消 API smoke（memory DB）。非 CI 必跑；本機驗收入口見 techstack「005 smoke」。
 */
import assert from 'node:assert/strict';
import { setupTestDatabase } from '../src/test-utils/testHarness.js';
import {
  addSampleCartItem,
  bootstrapCartSession,
  merchantGet,
  postCancelOrder,
  postCreateOrder,
  postPayOrder,
} from '../src/__tests__/testHelpers.js';

process.env.USE_MEMORY_DB = '1';
process.env.MERCHANT_TOKEN = process.env.MERCHANT_TOKEN || 'test-merchant-token';

await setupTestDatabase();
const { default: app } = await import('../src/server.js');

const session = await bootstrapCartSession(app);
await addSampleCartItem(app, session);
const created = await postCreateOrder(app, session);
assert.equal(created.status, 201);
const orderNumber = created.body.order.order_number;

const paid = await postPayOrder(app, session, orderNumber);
assert.equal(paid.status, 200);
assert.equal(paid.body.order.payment_status, 'paid');

const merchant = await merchantGet(app, `/api/merchant/orders/${orderNumber}`);
assert.equal(merchant.body.order.payment_status, 'paid');

const session2 = await bootstrapCartSession(app);
await addSampleCartItem(app, session2);
const created2 = await postCreateOrder(app, session2);
const orderNumber2 = created2.body.order.order_number;
const cancelled = await postCancelOrder(app, session2, orderNumber2);
assert.equal(cancelled.status, 200);
assert.equal(cancelled.body.order.status, 'cancelled');

console.log('smoke-005-payment: pass (pay, merchant detail, cancel)');
