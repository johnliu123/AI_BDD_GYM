import test from 'node:test';
import assert from 'node:assert/strict';
import { createCartApi } from './cartApi.js';

function jsonResponse(body, ok = true, status = 200) {
  return { ok, status, json: async () => body };
}

test('bootstraps a session and sends the session CSRF token with cart writes', async () => {
  const calls = [];
  const api = createCartApi(async (url, options) => {
    calls.push({ url, options });
    return jsonResponse({ cart: { items: [], total: '0.00' }, csrf_token: 'session-token' });
  });

  await api.getCart();
  await api.addItem({ menu_item_id: 'item-1', quantity: 1, menu_item_option_ids: [] });

  assert.equal(calls[0].options.credentials, 'include');
  assert.equal(calls[1].options.method, 'POST');
  assert.equal(calls[1].options.headers['X-CSRF-Token'], 'session-token');
  assert.deepEqual(JSON.parse(calls[1].options.body), {
    menu_item_id: 'item-1',
    quantity: 1,
    menu_item_option_ids: [],
  });
});

test('addItem bootstraps the session when getCart was not called first', async () => {
  const calls = [];
  const api = createCartApi(async (url, options) => {
    calls.push({ url, options });
    return jsonResponse({ cart: { items: [], total: '0.00' }, csrf_token: 'auto-token' });
  });

  await api.addItem({ menu_item_id: 'item-2', quantity: 1, menu_item_option_ids: [] });

  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, '/api/cart');
  assert.equal(calls[1].options.headers['X-CSRF-Token'], 'auto-token');
});

test('shares the bootstrap request to avoid creating competing sessions', async () => {
  let calls = 0;
  const api = createCartApi(async () => {
    calls += 1;
    return jsonResponse({ cart: { items: [], total: '0.00' }, csrf_token: 'token' });
  });

  await Promise.all([api.getCart(), api.getCart()]);
  assert.equal(calls, 1);
});

test('fetches fresh cart state after the shared bootstrap request completes', async () => {
  let calls = 0;
  const api = createCartApi(async () => {
    calls += 1;
    return jsonResponse({
      cart: { items: [], total: calls === 1 ? '0.00' : '220.00' },
      csrf_token: 'stable-token',
    });
  });

  const [first, concurrent] = await Promise.all([api.getCart(), api.getCart()]);
  const refreshed = await api.getCart();

  assert.equal(calls, 2);
  assert.equal(first.cart.total, '0.00');
  assert.equal(concurrent.cart.total, '0.00');
  assert.equal(refreshed.cart.total, '220.00');
});

test('maps update and delete operations to the item endpoint', async () => {
  const calls = [];
  const api = createCartApi(async (url, options) => {
    calls.push({ url, options });
    return jsonResponse({ cart: { items: [], total: '0.00' }, csrf_token: 'token' });
  });

  await api.getCart();
  await api.updateItem('cart/item 1', 3);
  await api.deleteItem('cart/item 1');

  assert.equal(calls[1].url, '/api/cart/items/cart%2Fitem%201');
  assert.equal(calls[1].options.method, 'PATCH');
  assert.deepEqual(JSON.parse(calls[1].options.body), { quantity: 3 });
  assert.equal(calls[2].options.method, 'DELETE');
});

test('preserves server error codes for cart actions', async () => {
  let calls = 0;
  const api = createCartApi(async () => {
    calls += 1;
    return calls === 1
      ? jsonResponse({ cart: { items: [], total: '0.00' }, csrf_token: 'token' })
      : jsonResponse({ error: { code: 'CART_ITEM_UNAVAILABLE', message: 'Item unavailable' } }, false, 409);
  });

  await api.getCart();
  await assert.rejects(api.updateItem('item-1', 2), {
    code: 'CART_ITEM_UNAVAILABLE',
    status: 409,
  });
});