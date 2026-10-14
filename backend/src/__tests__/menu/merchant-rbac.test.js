import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import {
  MERCHANT_MENU_ONLY_TOKEN,
  MERCHANT_ORDERS_ONLY_TOKEN,
  MERCHANT_TEST_TOKEN,
  bootstrapCartSession,
  createSampleOrder,
  merchantGet,
  merchantPost,
} from '../testHelpers.js';

test.before(async () => {
  await setupTestDatabase();
});

const { default: app } = await import('../../server.js');

test('admin token can access menu and accept order', async () => {
  const session = await bootstrapCartSession(app);
  const created = await createSampleOrder(app, session);
  const orderNumber = created.body.order.order_number;

  const menu = await merchantGet(app, '/api/merchant/categories');
  assert.equal(menu.status, 200);

  const accept = await merchantPost(app, `/api/merchant/orders/${orderNumber}/accept`);
  assert.equal(accept.status, 200);
});

test('orders-only cannot POST menu item', async () => {
  const response = await merchantPost(app, '/api/merchant/menu-items', {
    token: MERCHANT_ORDERS_ONLY_TOKEN,
    body: { name: 'X', price: '10.00', category_id: 'cat-1' },
  });
  assert.equal(response.status, 403);
});

test('menu-only cannot accept order', async () => {
  const session = await bootstrapCartSession(app);
  const created = await createSampleOrder(app, session);
  const response = await merchantPost(app, `/api/merchant/orders/${created.body.order.order_number}/accept`, {
    token: MERCHANT_MENU_ONLY_TOKEN,
  });
  assert.equal(response.status, 403);
});

test('missing token is 401', async () => {
  const response = await request(app).get('/api/merchant/categories');
  assert.equal(response.status, 401);
});

test('legacy MERCHANT_TOKEN works when MERCHANT_CREDENTIALS JSON is invalid', async () => {
  const savedToken = process.env.MERCHANT_TOKEN;
  const savedCredentials = process.env.MERCHANT_CREDENTIALS;
  process.env.MERCHANT_TOKEN = 'legacy-only-token';
  process.env.MERCHANT_CREDENTIALS = '{not-json';
  try {
    const response = await merchantGet(app, '/api/merchant/categories', { token: 'legacy-only-token' });
    assert.equal(response.status, 200);
  } finally {
    process.env.MERCHANT_TOKEN = savedToken;
    process.env.MERCHANT_CREDENTIALS = savedCredentials;
  }
});

test('503 when no merchant credentials configured', async () => {
  const savedToken = process.env.MERCHANT_TOKEN;
  const savedCredentials = process.env.MERCHANT_CREDENTIALS;
  delete process.env.MERCHANT_TOKEN;
  delete process.env.MERCHANT_CREDENTIALS;
  try {
    const response = await merchantGet(app, '/api/merchant/categories', { token: MERCHANT_TEST_TOKEN });
    assert.equal(response.status, 503);
  } finally {
    process.env.MERCHANT_TOKEN = savedToken;
    process.env.MERCHANT_CREDENTIALS = savedCredentials;
  }
});

test('client role header is ignored', async () => {
  const response = await request(app)
    .get('/api/merchant/categories')
    .set('X-Merchant-Token', MERCHANT_MENU_ONLY_TOKEN)
    .set('X-Merchant-Role', 'admin');
  assert.equal(response.status, 200);
});
