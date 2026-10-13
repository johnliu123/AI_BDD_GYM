import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { getPool } from '../../config/db.js';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import { activeOptionIds, bootstrapCartSession, pickMenuItemWithGroups, sessionCookieValue } from '../testHelpers.js';
import { runSessionMaintenance } from '../../repositories/guestSessionRepository.js';

test.before(async () => {
  await setupTestDatabase();
});

const { default: app } = await import('../../server.js');

test('expired session receives new empty cart and orphan carts are cleaned', async () => {
  const menuResponse = await request(app).get('/api/menu-items');
  const item = pickMenuItemWithGroups(menuResponse.body.items);
  const session = await bootstrapCartSession(app);

  await request(app)
    .post('/api/cart/items')
    .set(session.headers)
    .send({
      menu_item_id: item.id,
      quantity: 1,
      menu_item_option_ids: activeOptionIds(item),
    });

  const pool = getPool();
  const sessionId = session.headers.Cookie.replace('guest_session=', '');
  const stale = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
  await pool.query(
    `UPDATE guest_sessions SET last_activity_at = $2, created_at = $2 WHERE session_id = $1`,
    [sessionId, stale]
  );

  const fresh = await request(app).get('/api/cart').set('Cookie', session.headers.Cookie);
  assert.equal(fresh.body.cart.items.length, 0);
  assert.notEqual(sessionCookieValue(fresh), session.headers.Cookie.replace('guest_session=', ''));

  await runSessionMaintenance();
  const carts = await pool.query('SELECT COUNT(*) AS count FROM carts');
  assert.equal(carts.rows[0].count, 0);
});
