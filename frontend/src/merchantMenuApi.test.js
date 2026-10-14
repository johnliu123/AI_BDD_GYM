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
