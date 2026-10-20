import test from 'node:test';
import assert from 'node:assert/strict';
import { createMerchantMenuApi, FORBIDDEN_MESSAGE } from './merchantMenuApi.js';

test('merchantMenuApi maps MERCHANT_FORBIDDEN to permission message', async () => {
  const fetcher = async () => ({
    ok: false,
    status: 403,
    json: async () => ({ error: { code: 'MERCHANT_FORBIDDEN', message: 'raw' } }),
  });
  const api = createMerchantMenuApi(fetcher, { merchantToken: 'test-token' });
  await assert.rejects(() => api.listCategories(), (error) => {
    assert.equal(error.code, 'MERCHANT_FORBIDDEN');
    assert.equal(error.message, FORBIDDEN_MESSAGE);
    return true;
  });
});

test('merchantMenuApi sends create and update item payloads including option groups', async () => {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      status: 200,
      json: async () => ({ item: {} }),
    };
  };
  const api = createMerchantMenuApi(fetcher, { merchantToken: 'test-token' });
  const body = {
    name: '手作咖哩',
    price: '125.00',
    category_id: 'category-id',
    image_url: null,
    is_active: true,
    option_groups: [{
      name: '辣度',
      is_required: true,
      options: [{ name: '小辣', price_adjustment: '5.00', is_active: true }],
    }],
  };

  await api.createMenuItem(body);
  await api.updateMenuItem('menu-item-id', body);

  assert.equal(calls[0].url, '/api/merchant/menu-items');
  assert.equal(calls[0].options.method, 'POST');
  assert.deepEqual(JSON.parse(calls[0].options.body), body);
  assert.equal(calls[1].url, '/api/merchant/menu-items/menu-item-id');
  assert.equal(calls[1].options.method, 'PATCH');
  assert.deepEqual(JSON.parse(calls[1].options.body), body);
});
