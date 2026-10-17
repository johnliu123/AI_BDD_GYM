import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setupTestDatabase } from '../../test-utils/testHarness.js';

test.before(async () => {
  await setupTestDatabase();
});

const { default: app } = await import('../../server.js');

const sessionCookieValue = (response) => {
  const raw = response.headers['set-cookie']?.[0] ?? '';
  const pair = raw.split(';')[0];
  return pair.startsWith('guest_session=') ? pair.slice('guest_session='.length) : '';
};

test('GET /api/cart initializes HttpOnly guest session cookie and zero cart', async () => {
  const response = await request(app).get('/api/cart');
  assert.equal(response.status, 200);
  const setCookie = response.headers['set-cookie']?.[0] ?? '';
  assert.match(setCookie, /guest_session=/);
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Lax/i);
  assert.match(setCookie, /Path=\//);
  assert.doesNotMatch(setCookie, /Max-Age=/i);
  assert.equal(response.body.cart.total, '0.00');
  assert.equal(response.body.cart.items.length, 0);
  assert.ok(response.body.csrf_token);
  assert.equal(response.headers['cache-control'], 'no-store');
});

test('OPTIONS /api/cart/items permits only configured credentialed origins', async () => {
  const allowed = await request(app)
    .options('/api/cart/items')
    .set('Origin', 'http://localhost:5173')
    .set('Access-Control-Request-Method', 'POST')
    .set('Access-Control-Request-Headers', 'content-type,x-csrf-token');
  const rejected = await request(app)
    .options('/api/cart/items')
    .set('Origin', 'https://evil.example')
    .set('Access-Control-Request-Method', 'POST');

  assert.equal(allowed.status, 204);
  assert.equal(allowed.headers['access-control-allow-origin'], 'http://localhost:5173');
  assert.equal(allowed.headers['access-control-allow-credentials'], 'true');
  assert.match(allowed.headers['access-control-allow-headers'], /X-CSRF-Token/i);
  assert.equal(rejected.status, 403);
});

test('expired guest sessions are removed and cannot be reused (absolute 7d policy)', async () => {
  const { createSessionRecord, getSessionById } = await import('../../repositories/guestSessionRepository.js');
  const session = await createSessionRecord();
  const expiredAt = session.created_at + 8 * 24 * 60 * 60 * 1000;

  assert.equal(await getSessionById(session.id, undefined, expiredAt), null);
});

test('session store rejects new sessions at its configured capacity', async () => {
  const { createSessionRecord } = await import('../../repositories/guestSessionRepository.js');
  const previousLimit = process.env.SESSION_MAX_COUNT;
  process.env.SESSION_MAX_COUNT = '1';
  await setupTestDatabase();

  try {
    await createSessionRecord();
    await assert.rejects(createSessionRecord(), (error) => error.code === 'SESSION_STORE_CAPACITY');
  } finally {
    if (previousLimit === undefined) {
      delete process.env.SESSION_MAX_COUNT;
    } else {
      process.env.SESSION_MAX_COUNT = previousLimit;
    }
    await setupTestDatabase();
  }
});

test('GET /api/cart returns 429 when session creation rate limit is exceeded', async () => {
  const { resetSessionCreationRateLimitForTests } = await import('../../utils/sessionCreationRateLimit.js');
  const previousMax = process.env.SESSION_CREATE_RATE_MAX;
  const previousWindow = process.env.SESSION_CREATE_RATE_WINDOW_MS;
  process.env.SESSION_CREATE_RATE_MAX = '2';
  process.env.SESSION_CREATE_RATE_WINDOW_MS = '60000';
  await resetSessionCreationRateLimitForTests();

  try {
    const first = await request(app).get('/api/cart');
    const second = await request(app).get('/api/cart');
    const third = await request(app).get('/api/cart');

    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal(third.status, 429);
    assert.equal(third.body.error.code, 'SESSION_CREATE_RATE_LIMITED');
  } finally {
    if (previousMax === undefined) delete process.env.SESSION_CREATE_RATE_MAX;
    else process.env.SESSION_CREATE_RATE_MAX = previousMax;
    if (previousWindow === undefined) delete process.env.SESSION_CREATE_RATE_WINDOW_MS;
    else process.env.SESSION_CREATE_RATE_WINDOW_MS = previousWindow;
    await resetSessionCreationRateLimitForTests();
    await setupTestDatabase();
  }
});

test('GET /api/cart returns 503 when the session store is full', async () => {
  const { createSessionRecord } = await import('../../repositories/guestSessionRepository.js');
  const previousLimit = process.env.SESSION_MAX_COUNT;
  process.env.SESSION_MAX_COUNT = '1';
  await setupTestDatabase();

  try {
    await createSessionRecord();
    const response = await request(app).get('/api/cart');
    assert.equal(response.status, 503);
    assert.equal(response.body.error.code, 'SESSION_STORE_CAPACITY');
  } finally {
    if (previousLimit === undefined) {
      delete process.env.SESSION_MAX_COUNT;
    } else {
      process.env.SESSION_MAX_COUNT = previousLimit;
    }
    await setupTestDatabase();
  }
});

test('GET /api/cart keeps the session CSRF token stable across reads', async () => {
  const first = await request(app).get('/api/cart');
  const cookie = sessionCookieValue(first);
  const second = await request(app).get('/api/cart').set('Cookie', `guest_session=${cookie}`);

  assert.equal(second.body.csrf_token, first.body.csrf_token);
});

test('POST /api/cart/items rejects invalid or missing Origin', async () => {
  const menuResponse = await request(app).get('/api/menu-items');
  const item = menuResponse.body.items.find((entry) => entry.option_groups && entry.option_groups.length > 0);
  const selectedOptionIds = item.option_groups.flatMap((group) => group.options.filter((option) => option.is_active).slice(0, 1).map((option) => option.id));

  const cartResponse = await request(app).get('/api/cart');
  const cookie = sessionCookieValue(cartResponse);

  const missingOrigin = await request(app)
    .post('/api/cart/items')
    .set('Cookie', `guest_session=${cookie}`)
    .set('X-CSRF-Token', cartResponse.body.csrf_token)
    .send({
      menu_item_id: item.id,
      quantity: 1,
      menu_item_option_ids: selectedOptionIds,
    });

  const invalidOrigin = await request(app)
    .post('/api/cart/items')
    .set('Origin', 'https://evil.example')
    .set('Cookie', `guest_session=${cookie}`)
    .set('X-CSRF-Token', cartResponse.body.csrf_token)
    .send({
      menu_item_id: item.id,
      quantity: 1,
      menu_item_option_ids: selectedOptionIds,
    });

  assert.equal(missingOrigin.status, 403);
  assert.equal(invalidOrigin.status, 403);

  const allowedReferer = await request(app)
    .post('/api/cart/items')
    .set('Referer', 'http://localhost:5173/')
    .set('Cookie', `guest_session=${cookie}`)
    .set('X-CSRF-Token', cartResponse.body.csrf_token)
    .send({
      menu_item_id: item.id,
      quantity: 1,
      menu_item_option_ids: selectedOptionIds,
    });

  assert.equal(allowedReferer.status, 201);
});

test('unknown session cookie yields a new empty cart instead of client-supplied session id', async () => {
  const response = await request(app)
    .get('/api/cart')
    .set('Cookie', 'guest_session=totally-unknown-session-id');

  assert.equal(response.status, 200);
  assert.notEqual(sessionCookieValue(response), 'totally-unknown-session-id');
  assert.equal(response.body.cart.items.length, 0);
  assert.equal(response.body.cart.total, '0.00');
});
