export function createCartApi(fetcher = fetch) {
  let csrfToken = null;
  let bootstrapPromise = null;

  async function ensureSessionReady(signal) {
    if (csrfToken) {
      return;
    }
    await getCart({ signal });
    if (!csrfToken) {
      const error = new Error('目前無法建立訪客工作階段。');
      error.code = 'CART_SESSION_NOT_INITIALIZED';
      throw error;
    }
  }

  async function request(path, { method = 'GET', body, signal } = {}) {
    const headers = { Accept: 'application/json' };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    if (method !== 'GET') {
      await ensureSessionReady(signal);
      headers['X-CSRF-Token'] = csrfToken;
    }

    const response = await fetcher(path, {
      method,
      credentials: 'include',
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
    const payload = await response.json();

    if (!response.ok) {
      const error = new Error(payload.error?.message || 'CART_REQUEST_FAILED');
      error.code = payload.error?.code || 'CART_REQUEST_FAILED';
      error.status = response.status;
      throw error;
    }

    if (payload.csrf_token) {
      csrfToken = payload.csrf_token;
    }
    return payload;
  }

  function getCart(options) {
    if (!bootstrapPromise) {
      bootstrapPromise = request('/api/cart', options).catch((error) => {
        bootstrapPromise = null;
        throw error;
      });
    }
    return bootstrapPromise;
  }

  return {
    getCart,
    addItem(payload) {
      return request('/api/cart/items', { method: 'POST', body: payload });
    },
    updateItem(itemId, quantity) {
      return request(`/api/cart/items/${encodeURIComponent(itemId)}`, {
        method: 'PATCH',
        body: { quantity },
      });
    },
    deleteItem(itemId) {
      return request(`/api/cart/items/${encodeURIComponent(itemId)}`, { method: 'DELETE' });
    },
  };
}

export const cartApi = createCartApi();