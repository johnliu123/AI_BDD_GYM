import { resolveMerchantToken } from './merchantOrderApi.js';

const FORBIDDEN_MESSAGE = '此操作需要更高權限，請使用具 menu 或 admin 角色的店家憑證。';

export function createMerchantMenuApi(fetcher = fetch, { merchantToken } = {}) {
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
          ? FORBIDDEN_MESSAGE
          : payload.error?.message || '店家菜單操作失敗。';
      const error = new Error(message);
      error.code = code;
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  return {
    listCategories() {
      return fetcher('/api/merchant/categories', { method: 'GET', headers: headers() }).then(parseResponse);
    },
    createCategory(body) {
      return fetcher('/api/merchant/categories', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(body),
      }).then(parseResponse);
    },
    updateCategory(categoryId, body) {
      return fetcher(`/api/merchant/categories/${encodeURIComponent(categoryId)}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify(body),
      }).then(parseResponse);
    },
    deleteCategory(categoryId) {
      return fetcher(`/api/merchant/categories/${encodeURIComponent(categoryId)}`, {
        method: 'DELETE',
        headers: headers(),
      }).then(async (response) => {
        if (response.status === 204) {
          return null;
        }
        return parseResponse(response);
      });
    },
    createMenuItem(body) {
      return fetcher('/api/merchant/menu-items', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(body),
      }).then(parseResponse);
    },
    updateMenuItem(menuItemId, body) {
      return fetcher(`/api/merchant/menu-items/${encodeURIComponent(menuItemId)}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify(body),
      }).then(parseResponse);
    },
    patchItemAvailability(menuItemId, isActive) {
      return fetcher(`/api/merchant/menu-items/${encodeURIComponent(menuItemId)}/availability`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ is_active: isActive }),
      }).then(parseResponse);
    },
    patchOptionAvailability(menuItemId, optionId, isActive) {
      return fetcher(
        `/api/merchant/menu-items/${encodeURIComponent(menuItemId)}/options/${encodeURIComponent(optionId)}/availability`,
        {
          method: 'PATCH',
          headers: headers(),
          body: JSON.stringify({ is_active: isActive }),
        }
      ).then(parseResponse);
    },
  };
}

export const merchantMenuApi = createMerchantMenuApi();

export { FORBIDDEN_MESSAGE };
