import request from 'supertest';

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
