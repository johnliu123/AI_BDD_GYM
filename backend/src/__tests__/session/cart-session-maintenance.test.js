import test from 'node:test';
import assert from 'node:assert/strict';
import { getPool } from '../../config/db.js';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import {
  createSessionRecord,
  deleteOrphanCarts,
  pruneExpiredSessions,
  runSessionMaintenance,
} from '../../repositories/guestSessionRepository.js';
import { ensureCartForSession } from '../../repositories/cartRepository.js';

test.before(async () => {
  await setupTestDatabase();
});

test('pruneExpiredSessions removes idle sessions and orphan cart cleanup deletes carts', async () => {
  const session = await createSessionRecord();
  await ensureCartForSession(session.id);

  const pool = getPool();
  const stale = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
  await pool.query(
    `UPDATE guest_sessions SET last_activity_at = $2, created_at = $2 WHERE session_id = $1`,
    [session.id, stale]
  );

  const pruned = await pruneExpiredSessions();
  assert.ok(pruned >= 1);

  const orphans = await deleteOrphanCarts();
  assert.ok(orphans >= 1);

  const remaining = await pool.query('SELECT COUNT(*) AS count FROM carts');
  assert.equal(remaining.rows[0].count, 0);
});

test('runSessionMaintenance executes prune and orphan cleanup together', async () => {
  await setupTestDatabase();
  const session = await createSessionRecord();
  await ensureCartForSession(session.id);
  await getPool().query('DELETE FROM guest_sessions WHERE session_id = $1', [session.id]);

  const removed = await runSessionMaintenance();
  assert.ok(removed >= 1);
});
