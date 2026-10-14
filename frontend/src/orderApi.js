import { createCartApi } from './cartApi.js';

export function createOrderApi(fetcher = fetch, cartClient = createCartApi(fetcher)) {
  async function createOrder({ idempotencyKey, body = {} } = {}) {
    const bootstrap = await cartClient.getCart();
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-Token': bootstrap.csrf_token,
    };
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await fetcher('/api/orders', {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify(body),
    });
    const payload = await response.json();

    if (!response.ok) {
      const error = new Error(payload.error?.message || 'ORDER_REQUEST_FAILED');
      error.code = payload.error?.code || 'ORDER_REQUEST_FAILED';
      error.status = response.status;
      throw error;
    }

    return payload;
  }

  async function payOrder(orderNumber, { idempotencyKey, body = {} } = {}) {
    const bootstrap = await cartClient.getCart();
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-Token': bootstrap.csrf_token,
    };
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await fetcher(`/api/orders/${encodeURIComponent(orderNumber)}/pay`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify(body),
    });
    const payload = await response.json();

    if (!response.ok) {
      const error = new Error(payload.error?.message || 'ORDER_REQUEST_FAILED');
      error.code = payload.error?.code || 'ORDER_REQUEST_FAILED';
      error.status = response.status;
      throw error;
    }

    return payload;
  }

  async function cancelOrder(orderNumber) {
    const bootstrap = await cartClient.getCart();
    const response = await fetcher(`/api/orders/${encodeURIComponent(orderNumber)}/cancel`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-Token': bootstrap.csrf_token,
      },
      body: JSON.stringify({}),
    });
    const payload = await response.json();

    if (!response.ok) {
      const error = new Error(payload.error?.message || 'ORDER_REQUEST_FAILED');
      error.code = payload.error?.code || 'ORDER_REQUEST_FAILED';
      error.status = response.status;
      throw error;
    }

    return payload;
  }

  async function getOrder(orderNumber, options = {}) {
    const response = await fetcher(`/api/orders/${encodeURIComponent(orderNumber)}`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
      signal: options.signal,
    });
    const payload = await response.json();

    if (!response.ok) {
      const error = new Error(payload.error?.message || 'ORDER_REQUEST_FAILED');
      error.code = payload.error?.code || 'ORDER_REQUEST_FAILED';
      error.status = response.status;
      throw error;
    }

    return payload;
  }

  return {
    cartApi: cartClient,
    createOrder,
    getOrder,
    payOrder,
    cancelOrder,
  };
}

export const orderApi = createOrderApi();
