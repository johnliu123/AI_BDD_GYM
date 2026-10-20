import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import {
  MERCHANT_ORDERS_ONLY_TOKEN,
  MERCHANT_TEST_TOKEN,
  addSampleCartItem,
  bootstrapCartSession,
  getOrderForSession,
  merchantPatch,
  merchantPost,
  postCreateOrder,
  updateMenuItemPrice,
} from '../testHelpers.js';

test.before(async () => {
  await setupTestDatabase();
});

const { default: app } = await import('../../server.js');

test('merchant creates category and menu item with option groups', async () => {
  const category = await merchantPost(app, '/api/merchant/categories', {
    body: { name: '測試分類', sort_order: 9 },
  });
  assert.equal(category.status, 201);
  const categoryId = category.body.category.id;

  const item = await merchantPost(app, '/api/merchant/menu-items', {
    body: {
      name: '測試餐點',
      price: '100.00',
      category_id: categoryId,
      option_groups: [
        {
          name: '甜度',
          is_required: true,
          options: [{ name: '正常', price_adjustment: '0.00', is_active: true }],
        },
      ],
    },
  });
  assert.equal(item.status, 201);
  assert.equal(item.body.item.option_groups.length, 1);

  const publicMenu = await request(app).get('/api/menu-items').query({ category_id: categoryId });
  assert.equal(publicMenu.status, 200);
  assert.ok(publicMenu.body.items.some((entry) => entry.name === '測試餐點'));
});

test('price patch reflects on public menu but not on existing order snapshot', async () => {
  const session = await bootstrapCartSession(app);
  await addSampleCartItem(app, session);
  const created = await postCreateOrder(app, session);
  const orderNumber = created.body.order.order_number;
  const snapshotTotal = created.body.order.total;

  await updateMenuItemPrice(app, 'item-1', '500.00');
  try {
    const menu = await request(app).get('/api/menu-items');
    const item = menu.body.items.find((entry) => entry.id === 'item-1');
    assert.equal(item.price, '500.00');

    const order = await getOrderForSession(app, session, orderNumber);
    assert.equal(order.body.order.total, snapshotTotal);
  } finally {
    await updateMenuItemPrice(app, 'item-1', '220.00');
  }
});

test('orders-only token cannot create menu item', async () => {
  const response = await merchantPost(app, '/api/merchant/menu-items', {
    token: MERCHANT_ORDERS_ONLY_TOKEN,
    body: { name: 'X', price: '1.00', category_id: 'cat-1' },
  });
  assert.equal(response.status, 403);
  assert.equal(response.body.error.code, 'MERCHANT_FORBIDDEN');
});

test('invalid create body returns 400', async () => {
  const response = await merchantPost(app, '/api/merchant/menu-items', { body: { name: '缺欄位' } });
  assert.equal(response.status, 400);
});

test('invalid menu price is rejected without creating an item', async () => {
  const response = await merchantPost(app, '/api/merchant/menu-items', {
    body: { name: '錯誤價格餐點', price: 'not-money', category_id: 'cat-1' },
  });
  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'INVALID_REQUEST_BODY');
  const menu = await request(app).get('/api/menu-items');
  assert.equal(menu.body.items.some((item) => item.name === '錯誤價格餐點'), false);
});

test('duplicate category name returns 409 and preserves the original category', async () => {
  const existing = await request(app).get('/api/categories');
  const name = existing.body.categories[0].name;
  const duplicate = await merchantPost(app, '/api/merchant/categories', { body: { name } });

  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.body.error.code, 'DUPLICATE_CATEGORY_NAME');
  const after = await request(app).get('/api/categories');
  assert.equal(after.body.categories.filter((category) => category.name === name).length, 1);
});

test('delete category with items returns 409 CATEGORY_IN_USE', async () => {
  const response = await request(app)
    .delete('/api/merchant/categories/cat-1')
    .set('X-Merchant-Token', MERCHANT_TEST_TOKEN);
  assert.equal(response.status, 409);
  assert.equal(response.body.error.code, 'CATEGORY_IN_USE');
});

test('update category name via PATCH', async () => {
  const created = await merchantPost(app, '/api/merchant/categories', {
    body: { name: '可刪分類', sort_order: 99 },
  });
  const id = created.body.category.id;
  const updated = await merchantPatch(app, `/api/merchant/categories/${id}`, {
    body: { name: '已更新分類' },
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.category.name, '已更新分類');
  const deleted = await request(app)
    .delete(`/api/merchant/categories/${id}`)
    .set('X-Merchant-Token', MERCHANT_TEST_TOKEN);
  assert.equal(deleted.status, 204);
});
