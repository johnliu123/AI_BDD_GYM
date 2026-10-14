const CLIENT_MESSAGES = {
  ITEM_UNAVAILABLE: '此餐點目前無法加入購物車。',
  INVALID_QUANTITY: '數量必須為正整數。',
  INVALID_OPTION_SELECTION: '規格選擇不完整或無效。',
  ITEM_NOT_FOUND: '找不到指定的購物車項目。',
  CART_ITEM_UNAVAILABLE: '此項目已停止供應，無法更新數量。',
  INVALID_ORIGIN: 'Origin 未被允許。',
  INVALID_CSRF_TOKEN: 'CSRF token 不正確或不存在。',
  SESSION_STORE_UNAVAILABLE: '目前無法建立訪客工作階段。',
  SESSION_STORE_CAPACITY: '工作階段服務已達容量上限。',
  SESSION_CREATE_RATE_LIMITED: '建立訪客工作階段過於頻繁，請稍後再試。',
  CART_EMPTY: '購物車沒有可送單的項目。',
  CART_HAS_UNAVAILABLE_ITEMS: '購物車含有不可用項目，請先移除後再送單。',
  ORDER_NOT_FOUND: '找不到訂單。',
  MERCHANT_UNAUTHORIZED: '店家憑證無效。',
  MERCHANT_NOT_CONFIGURED: '店家功能尚未設定。',
  INVALID_STATUS_FILTER: '無效的訂單狀態篩選。',
  ORDER_STATUS_CONFLICT: '訂單狀態已變更，請重新整理後再試。',
  MERCHANT_FORBIDDEN: '此操作需要更高權限。',
  NOT_FOUND: '找不到請求的資源。',
  INVALID_REQUEST_BODY: '請求格式不正確。',
  CATEGORY_NOT_FOUND: '找不到分類。',
  CATEGORY_IN_USE: '分類下仍有餐點，無法刪除。',
  DUPLICATE_CATEGORY_NAME: '分類名稱已存在。',
  MENU_ITEM_NOT_FOUND: '找不到餐點。',
  MENU_OPTION_NOT_FOUND: '找不到規格選項。',
  INVALID_CATEGORY_ID: '未找到指定分類。',
};

export function toClientErrorPayload(error, fallbackMessage = '請求無法完成。') {
  const status = Number(error?.status || 500);
  const code = error?.code || (status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_FAILED');

  if (status >= 500) {
    return {
      status,
      body: {
        error: {
          code: 'INTERNAL_ERROR',
          message: '伺服器錯誤',
        },
      },
    };
  }

  return {
    status,
    body: {
      error: {
        code,
        message: error?.exposedMessage || CLIENT_MESSAGES[code] || fallbackMessage,
      },
    },
  };
}
