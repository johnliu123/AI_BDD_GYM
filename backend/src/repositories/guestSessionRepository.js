import crypto from 'node:crypto';
import { getPool } from '../config/db.js';

const SESSION_COOKIE_NAME = 'guest_session';

const SQL_DELETE_GUEST_SESSION_IF_UNREFERENCED = `
DELETE FROM guest_sessions
WHERE session_id = $1
AND NOT EXISTS (SELECT 1 FROM orders WHERE guest_session_id = $1)
AND NOT EXISTS (SELECT 1 FROM order_idempotency_keys WHERE guest_session_id = $1)
AND NOT EXISTS (SELECT 1 FROM payment_idempotency_keys WHERE guest_session_id = $1)
`;

async function deleteGuestSessionIfUnreferenced(client, sessionId) {
  const result = await client.query(SQL_DELETE_GUEST_SESSION_IF_UNREFERENCED, [sessionId]);
  return (result.rowCount ?? 0) > 0;
}

export function getSessionLimits() {
  const positiveInteger = (value, fallback) => {
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
  };

  return {
    idleTimeoutMs: positiveInteger(process.env.SESSION_IDLE_TIMEOUT_MS, 24 * 60 * 60 * 1000),
    absoluteTimeoutMs: positiveInteger(process.env.SESSION_ABSOLUTE_TIMEOUT_MS, 7 * 24 * 60 * 60 * 1000),
    maxSessions: positiveInteger(process.env.SESSION_MAX_COUNT, 5000),
  };
}

function isExpired(row, now, limits) {
  const createdAt = new Date(row.created_at).getTime();
  const lastActivity = new Date(row.last_activity_at).getTime();
  return now - lastActivity >= limits.idleTimeoutMs || now - createdAt >= limits.absoluteTimeoutMs;
}

export function parseSessionCookie(cookieHeader) {
  if (!cookieHeader) {
    return null;
  }

  const entries = cookieHeader.split(';').map((entry) => entry.trim());
  const guestEntry = entries.find((entry) => entry.startsWith(`${SESSION_COOKIE_NAME}=`));

  if (!guestEntry) {
    return null;
  }

  return guestEntry.slice(`${SESSION_COOKIE_NAME}=`.length) || null;
}

export async function countSessions(client) {
  const result = await client.query('SELECT COUNT(*) AS count FROM guest_sessions');
  return Number(result.rows[0]?.count ?? 0);
}

export async function getSessionById(sessionId, client = getPool(), now = Date.now()) {
  const result = await client.query(
    'SELECT session_id, csrf_token, created_at, last_activity_at FROM guest_sessions WHERE session_id = $1',
    [sessionId]
  );
  const row = result.rows[0];
  if (!row) {
    return null;
  }

  if (isExpired(row, now, getSessionLimits())) {
    await deleteGuestSessionIfUnreferenced(client, sessionId);
    return null;
  }

  await client.query(
    'UPDATE guest_sessions SET last_activity_at = SYSUTCDATETIME() WHERE session_id = $1',
    [sessionId]
  );

  return {
    id: row.session_id,
    csrf_token: row.csrf_token,
    created_at: new Date(row.created_at).getTime(),
    last_activity_at: now,
  };
}

export async function createSessionRecord(client = getPool()) {
  const limits = getSessionLimits();
  await pruneExpiredSessions(client);

  const count = await countSessions(client);
  if (count >= limits.maxSessions) {
    const error = new Error('SESSION_STORE_CAPACITY');
    error.code = 'SESSION_STORE_CAPACITY';
    error.status = 503;
    throw error;
  }

  const sessionId = crypto.randomBytes(16).toString('hex');
  const csrfToken = crypto.randomBytes(24).toString('hex');

  await client.query(
    `INSERT INTO guest_sessions (session_id, csrf_token, created_at, last_activity_at)
     VALUES ($1, $2, SYSUTCDATETIME(), SYSUTCDATETIME())`,
    [sessionId, csrfToken]
  );

  return {
    id: sessionId,
    csrf_token: csrfToken,
    created_at: Date.now(),
    last_activity_at: Date.now(),
  };
}

export async function pruneExpiredSessions(client = getPool(), now = Date.now()) {
  const limits = getSessionLimits();
  const result = await client.query(
    'SELECT session_id, created_at, last_activity_at FROM guest_sessions'
  );

  const expiredIds = result.rows
    .filter((row) => isExpired(row, now, limits))
    .map((row) => row.session_id);

  if (expiredIds.length === 0) {
    return 0;
  }

  let removed = 0;
  for (const sessionId of expiredIds) {
    if (await deleteGuestSessionIfUnreferenced(client, sessionId)) {
      removed += 1;
    }
  }
  return removed;
}

export async function deleteOrphanCarts(client = getPool()) {
  const result = await client.query(
    `DELETE FROM carts
     WHERE guest_session_id NOT IN (SELECT session_id FROM guest_sessions)`
  );
  return result.rowCount ?? 0;
}

export async function runSessionMaintenance(client = getPool()) {
  await pruneExpiredSessions(client);
  return deleteOrphanCarts(client);
}

export { SESSION_COOKIE_NAME };
