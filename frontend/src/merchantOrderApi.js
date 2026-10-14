/** Dev-only: Vite embeds VITE_* in client bundles — never set in production builds. */
export function resolveMerchantToken(explicitToken) {
  if (explicitToken !== undefined && explicitToken !== null) {
    return String(explicitToken);
  }
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_MERCHANT_TOKEN || '';
  }
  return '';
}

export function createMerchantOrderApi(fetcher = fetch, { merchantToken } = {}) {
  function headers() {
    const token = resolveMerchantToken(merchantToken);
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Merchant-Token': token,
    };
  }

  async function parseResponse(response) {
    const payload = await response.json();
    if (!response.ok) {
      const code = payload.error?.code || 'MERCHANT_REQUEST_FAILED';
      const message =
        code === 'MERCHANT_FORBIDDEN'
          ? '此操作需要更高權限，請使用具 orders 或 admin 角色的店家憑證。'
          : payload.error?.message || 'MERCHANT_REQUEST_FAILED';
      const error = new Error(message);
      error.code = code;
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  async function listOrders({ status, paymentStatus } = {}) {
    const params = new URLSearchParams();
    if (status) {
      params.set('status', status);
    }
    if (paymentStatus) {
      params.set('payment_status', paymentStatus);
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetcher(`/api/merchant/orders${query}`, {
      method: 'GET',
      headers: headers(),
    });
    return parseResponse(response);
  }

  async function getOrder(orderNumber) {
    const response = await fetcher(`/api/merchant/orders/${encodeURIComponent(orderNumber)}`, {
      method: 'GET',
      headers: headers(),
    });
    return parseResponse(response);
  }

  async function postAction(orderNumber, action, body = {}) {
    const response = await fetcher(`/api/merchant/orders/${encodeURIComponent(orderNumber)}/${action}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    });
    return parseResponse(response);
  }

  return {
    listOrders,
    getOrder,
    acceptOrder: (orderNumber, body) => postAction(orderNumber, 'accept', body),
    startPreparing: (orderNumber, body) => postAction(orderNumber, 'start-preparing', body),
    completeOrder: (orderNumber, body) => postAction(orderNumber, 'complete', body),
  };
}

export const merchantOrderApi = createMerchantOrderApi();
