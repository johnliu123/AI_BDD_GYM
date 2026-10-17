import { getMenuItemById } from '../repositories/menuRepository.js';
import {
  createSessionRecord,
  getSessionById,
  parseSessionCookie,
  SESSION_COOKIE_NAME,
} from '../repositories/guestSessionRepository.js';
import {
  deleteCartItem as deleteCartItemRow,
  insertCartItem,
  loadCartRows,
  updateCartItemQuantity,
  withTransaction,
} from '../repositories/cartRepository.js';
import { buildCartState, findOption, getOptionGroups, hasValidOptionSelection, isItemAvailable } from './cartPricing.js';
import { assertSessionCreationAllowed } from '../utils/sessionCreationRateLimit.js';

const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

export function getAllowedOrigins() {
  const configuredOrigins = (process.env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(','))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set(configuredOrigins);
}

function setSessionCookie(res, sessionId) {
  const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; SameSite=Lax${secureFlag}`);
}

export async function ensureSession(req, res) {
  const cookieHeader = req.headers.cookie || '';
  const sessionId = parseSessionCookie(cookieHeader);
  let session = sessionId ? await getSessionById(sessionId) : null;

  if (!session) {
    try {
      await assertSessionCreationAllowed(req);
      session = await createSessionRecord();
      setSessionCookie(res, session.id);
    } catch (error) {
      const status = error.status || 503;
      const code = error.code || 'SESSION_STORE_UNAVAILABLE';
      const message = code === 'SESSION_CREATE_RATE_LIMITED'
        ? '建立訪客工作階段過於頻繁，請稍後再試。'
        : '目前無法建立訪客工作階段。';
      res.status(status).json({
        error: {
          code,
          message,
        },
      });
      return null;
    }
  }

  req.session = session;
  req.sessionID = session.id;
  return session;
}

function resolveRequestOrigin(req) {
  const origin = String(req.headers.origin || '').trim();
  if (origin) {
    return origin;
  }
  const referer = String(req.headers.referer || req.headers.referrer || '').trim();
  if (!referer) {
    return '';
  }
  try {
    return new URL(referer).origin;
  } catch {
    return '';
  }
}

export function validateOrigin(req, res) {
  if (req.method === 'GET') {
    return true;
  }

  const origin = resolveRequestOrigin(req);
  if (!origin || !getAllowedOrigins().has(origin)) {
    res.status(403).json({
      error: {
        code: 'INVALID_ORIGIN',
        message: 'Origin 未被允許。',
      },
    });
    return false;
  }

  return true;
}

export function validateCsrf(req, res) {
  const providedToken = (req.headers['x-csrf-token'] || req.headers['X-CSRF-Token'] || '').toString();

  if (req.method === 'GET') {
    return true;
  }

  if (!providedToken || providedToken !== req.session?.csrf_token) {
    res.status(403).json({
      error: {
        code: 'INVALID_CSRF_TOKEN',
        message: 'CSRF token 不正確或不存在。',
      },
    });
    return false;
  }

  return true;
}

export function validateAddItemPayload(payload) {
  const menuId = payload?.menu_item_id;
  const quantity = Number(payload?.quantity);
  const selectedIds = payload?.menu_item_option_ids;

  const menuItem = getMenuItemById(menuId);
  if (!menuItem) {
    const error = new Error('ITEM_UNAVAILABLE');
    error.code = 'ITEM_UNAVAILABLE';
    error.status = 409;
    throw error;
  }
  if (!menuItem.is_active) {
    const error = new Error('CART_ITEM_UNAVAILABLE');
    error.code = 'CART_ITEM_UNAVAILABLE';
    error.status = 409;
    throw error;
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    const error = new Error('INVALID_QUANTITY');
    error.code = 'INVALID_QUANTITY';
    error.status = 400;
    throw error;
  }

  if (!hasValidOptionSelection(menuItem, selectedIds)) {
    const error = new Error('INVALID_OPTION_SELECTION');
    error.code = 'INVALID_OPTION_SELECTION';
    error.status = 400;
    throw error;
  }

  const optionRows = [];
  for (const optionId of selectedIds) {
    const match = findOption(menuItem, optionId);
    if (!match || match.group.menu_item_id && match.group.menu_item_id !== menuItem.id) {
      const error = new Error('INVALID_OPTION_SELECTION');
      error.code = 'INVALID_OPTION_SELECTION';
      error.status = 400;
      throw error;
    }
    optionRows.push({
      option_group_id: match.group.id,
      menu_item_option_id: match.option.id,
    });
  }

  return {
    menu_item_id: menuId,
    quantity,
    option_rows: optionRows,
    menu_item_option_ids: selectedIds.slice(),
  };
}

export async function addCartItem(sessionId, itemPayload) {
  const validated = validateAddItemPayload(itemPayload);

  await withTransaction(async (client) => {
    await insertCartItem(sessionId, validated, client);
  });

  return readCart(sessionId);
}

export async function updateCartItem(sessionId, itemId, nextQuantity) {
  const rows = await loadCartRows(sessionId);
  const entry = rows.find((row) => row.id === itemId);
  if (!entry) {
    const error = new Error('ITEM_NOT_FOUND');
    error.code = 'ITEM_NOT_FOUND';
    error.status = 404;
    throw error;
  }

  if (!Number.isInteger(nextQuantity) || nextQuantity <= 0) {
    const error = new Error('INVALID_QUANTITY');
    error.code = 'INVALID_QUANTITY';
    error.status = 400;
    throw error;
  }

  const menuItem = getMenuItemById(entry.menu_item_id);
  if (!isItemAvailable(menuItem, entry.menu_item_option_ids)) {
    const error = new Error('CART_ITEM_UNAVAILABLE');
    error.code = 'CART_ITEM_UNAVAILABLE';
    error.status = 409;
    throw error;
  }

  const updated = await updateCartItemQuantity(sessionId, itemId, nextQuantity);
  if (!updated) {
    const error = new Error('ITEM_NOT_FOUND');
    error.code = 'ITEM_NOT_FOUND';
    error.status = 404;
    throw error;
  }

  return readCart(sessionId);
}

export async function deleteCartItem(sessionId, itemId) {
  const deleted = await deleteCartItemRow(sessionId, itemId);
  if (!deleted) {
    const error = new Error('ITEM_NOT_FOUND');
    error.code = 'ITEM_NOT_FOUND';
    error.status = 404;
    throw error;
  }

  return readCart(sessionId);
}

export async function readCart(sessionId) {
  const rows = await loadCartRows(sessionId);
  return buildCartState(rows);
}

export function refreshCsrf(session) {
  return session.csrf_token;
}

export { getOptionGroups };
