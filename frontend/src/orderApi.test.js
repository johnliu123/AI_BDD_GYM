import test from 'node:test';
import assert from 'node:assert/strict';
import { createCartApi } from './cartApi.js';
import { createOrderApi } from './orderApi.js';

function jsonResponse(body, ok = true, status = 200) {
  return { ok, status, json: async () => body };
}

test('createOrder bootstraps CSRF via cart and sends empty body', async () => {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url, options });
    if (url === '/api/cart') {
      return jsonResponse({ cart: { items: [], total: '0.00' }, csrf_token: 'csrf-1' });
    }
    return jsonResponse({
      order: {
        order_number: 'ORD-20261013-AABBCCDD',
        status: 'created',
        status_label: '已建立',
        total: '100.00',
        items: [],
        created_at: '2026-10-13T00:00:00.000Z',
      },
    }, true, 201);
  };

  const api = createOrderApi(fetcher, createCartApi(fetcher));
  await api.createOrder({ body: {} });

  const createCall = calls.find((entry) => entry.url === '/api/orders');
  assert.equal(createCall.options.method, 'POST');
  assert.equal(createCall.options.credentials, 'include');
  assert.equal(createCall.options.headers['X-CSRF-Token'], 'csrf-1');
  assert.deepEqual(JSON.parse(createCall.options.body), {});
  assert.equal(createCall.options.headers['Idempotency-Key'], undefined);
});

test('createOrder forwards optional Idempotency-Key header', async () => {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url, options });
    if (url === '/api/cart') {
      return jsonResponse({ cart: { items: [], total: '0.00' }, csrf_token: 'csrf-2' });
    }
    return jsonResponse({ order: { order_number: 'ORD-1', status: 'created', status_label: '已建立', total: '0.00', items: [], created_at: '2026-10-13T00:00:00.000Z' } }, true, 201);
  };

  const api = createOrderApi(fetcher, createCartApi(fetcher));
  await api.createOrder({ idempotencyKey: 'key-abc' });
  const createCall = calls.find((entry) => entry.url === '/api/orders');
  assert.equal(createCall.options.headers['Idempotency-Key'], 'key-abc');
});

test('getOrder maps path and surfaces 404 errors', async () => {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url, options });
    return jsonResponse({ error: { code: 'ORDER_NOT_FOUND', message: '找不到訂單。' } }, false, 404);
  };

  const api = createOrderApi(fetcher, createCartApi(fetcher));
  await assert.rejects(api.getOrder('ORD-20260101-00000000'), {
    code: 'ORDER_NOT_FOUND',
    status: 404,
  });
  assert.equal(calls[0].url, '/api/orders/ORD-20260101-00000000');
  assert.equal(calls[0].options.credentials, 'include');
});
