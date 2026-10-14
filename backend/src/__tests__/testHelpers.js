import request from 'supertest';
import { getPool } from '../config/db.js';

export function sessionCookieValue(response) {
  const raw = response.headers['set-cookie']?.[0] ?? '';
  const pair = raw.split(';')[0];
  return pair.startsWith('guest_session=') ? pair.slice('guest_session='.length) : '';
}

export async function bootstrapCartSession(app, origin = 'http://localhost:5173') {
  const cartResponse = await request(app).get('/api/cart').set('Origin', origin);
  const cookie = sessionCookieValue(cartResponse);
  return {
    cookie,
    csrf: cartResponse.body.csrf_token,
    headers: {
      Origin: origin,
      Cookie: `guest_session=${cookie}`,
      'X-CSRF-Token': cartResponse.body.csrf_token,
    },
  };
}

export function pickMenuItemWithGroups(items) {
  return items.find((entry) => entry.option_groups && entry.option_groups.length > 0);
}

export function activeOptionIds(item) {
  return item.option_groups.flatMap((group) => group.options.filter((option) => option.is_active).slice(0, 1).map((option) => option.id));
}

export async function addSampleCartItem(app, session, menuItemId = 'item-1', optionIds = ['opt-1', 'opt-4']) {
  return request(app)
    .post('/api/cart/items')
    .set(session.headers)
    .send({
      menu_item_id: menuItemId,
      quantity: 1,
      menu_item_option_ids: optionIds,
    });
}

export function postCreateOrder(app, session, { body = {}, idempotencyKey } = {}) {
  const headers = { ...session.headers };
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }
  return request(app).post('/api/orders').set(headers).send(body);
}

export const MERCHANT_TEST_TOKEN = 'test-merchant-token';
export const MERCHANT_ORDERS_ONLY_TOKEN = 'test-orders-only';
export const MERCHANT_MENU_ONLY_TOKEN = 'test-menu-only';

export function merchantHeaders(token = MERCHANT_TEST_TOKEN) {
  return { 'X-Merchant-Token': token };
}

export async function createSampleOrder(app, session) {
  await addSampleCartItem(app, session);
  return postCreateOrder(app, session, { body: {} });
}

export function getOrderForSession(app, session, orderNumber) {
  return request(app)
    .get(`/api/orders/${encodeURIComponent(orderNumber)}`)
    .set(session.headers);
}

export function merchantGet(app, path, { token = MERCHANT_TEST_TOKEN, query } = {}) {
  let req = request(app).get(path).set(merchantHeaders(token));
  if (query) {
    req = req.query(query);
  }
  return req;
}

export function merchantPost(app, path, { token = MERCHANT_TEST_TOKEN, body = {} } = {}) {
  return request(app).post(path).set(merchantHeaders(token)).send(body);
}

export function merchantPatch(app, path, { token = MERCHANT_TEST_TOKEN, body = {} } = {}) {
  return request(app).patch(path).set(merchantHeaders(token)).send(body);
}

export async function setMenuOptionActive(app, menuItemId, optionId, isActive, token = MERCHANT_TEST_TOKEN) {
  return merchantPatch(app, `/api/merchant/menu-items/${menuItemId}/options/${optionId}/availability`, {
    token,
    body: { is_active: isActive },
  });
}

export async function setMenuItemActive(app, menuItemId, isActive, token = MERCHANT_TEST_TOKEN) {
  return merchantPatch(app, `/api/merchant/menu-items/${menuItemId}/availability`, {
    token,
    body: { is_active: isActive },
  });
}

export async function updateMenuItemPrice(app, menuItemId, price, token = MERCHANT_TEST_TOKEN) {
  return merchantPatch(app, `/api/merchant/menu-items/${menuItemId}`, {
    token,
    body: { price },
  });
}

export function postPayOrder(app, session, orderNumber, { body = {}, idempotencyKey } = {}) {
  const headers = { ...session.headers };
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }
  return request(app)
    .post(`/api/orders/${encodeURIComponent(orderNumber)}/pay`)
    .set(headers)
    .send(body);
}

export function postCancelOrder(app, session, orderNumber, body = {}) {
  return request(app)
    .post(`/api/orders/${encodeURIComponent(orderNumber)}/cancel`)
    .set(session.headers)
    .send(body);
}

/** Test-only: seed payment_status (memory DB + integration tests). */
export async function forceOrderPaymentStatus(orderNumber, sessionId, paymentStatus, updatedAtIso) {
  const pool = getPool();
  await pool.query(
    `UPDATE orders SET payment_status = $3, payment_status_updated_at = $4 WHERE order_number = $1 AND guest_session_id = $2`,
    [orderNumber, sessionId, paymentStatus, updatedAtIso]
  );
}

export async function countPaymentIdempotencyKeys() {
  const pool = getPool();
  const result = await pool.query('SELECT COUNT(*) AS count FROM payment_idempotency_keys');
  return Number(result.rows[0]?.count ?? 0);
}
