import test from 'node:test';
import assert from 'node:assert/strict';
import { createMerchantOrderApi, resolveMerchantToken } from './merchantOrderApi.js';

function jsonResponse(body, ok = true, status = 200) {
  return { ok, status, json: async () => body };
}

test('resolveMerchantToken prefers explicit override', () => {
  assert.equal(resolveMerchantToken('from-test'), 'from-test');
});

test('listOrders sends X-Merchant-Token header', async () => {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url, options });
    return jsonResponse({ orders: [] });
  };

  const api = createMerchantOrderApi(fetcher, { merchantToken: 'secret-token' });
  await api.listOrders();

  assert.equal(calls[0].url, '/api/merchant/orders');
  assert.equal(calls[0].options.headers['X-Merchant-Token'], 'secret-token');
});

test('acceptOrder maps 401 to MERCHANT_UNAUTHORIZED', async () => {
  const fetcher = async () =>
    jsonResponse(
      { error: { code: 'MERCHANT_UNAUTHORIZED', message: '店家憑證無效。' } },
      false,
      401
    );

  const api = createMerchantOrderApi(fetcher, { merchantToken: 'bad' });
  await assert.rejects(
    () => api.acceptOrder('ORD-20261014-AABBCCDD'),
    (error) => {
      assert.equal(error.code, 'MERCHANT_UNAUTHORIZED');
      assert.equal(error.status, 401);
      return true;
    }
  );
});
