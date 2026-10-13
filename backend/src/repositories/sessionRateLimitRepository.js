import { getPool } from '../config/db.js';
import { withTransaction } from './cartRepository.js';

function getLimits() {
  const windowMs = Number(process.env.SESSION_CREATE_RATE_WINDOW_MS);
  const max = Number(process.env.SESSION_CREATE_RATE_MAX);
  return {
    windowMs: Number.isFinite(windowMs) && windowMs > 0 ? windowMs : 60_000,
    max: Number.isFinite(max) && max > 0 ? max : 60,
  };
}

function createRateLimitError() {
  const error = new Error('SESSION_CREATE_RATE_LIMITED');
  error.code = 'SESSION_CREATE_RATE_LIMITED';
  error.status = 429;
  return error;
}

export async function consumeSessionCreationSlot(clientKey, now = Date.now()) {
  const { windowMs, max } = getLimits();

  await withTransaction(async (client) => {
    const existing = await client.query(
      'SELECT window_start_ms, request_count FROM session_create_rate_limits WHERE client_key = $1',
      [clientKey]
    );
    const row = existing.rows[0];
    const previousWindow = row ? Number(row.window_start_ms) : null;
    const expired = !row || now - previousWindow >= windowMs;

    let windowStart = expired ? now : previousWindow;
    let nextCount = expired ? 0 : Number(row.request_count);

    nextCount += 1;
    if (nextCount > max) {
      throw createRateLimitError();
    }

    if (!row) {
      await client.query(
        'INSERT INTO session_create_rate_limits (client_key, window_start_ms, request_count) VALUES ($1, $2, $3)',
        [clientKey, windowStart, nextCount]
      );
      return;
    }

    if (expired) {
      await client.query(
        'UPDATE session_create_rate_limits SET window_start_ms = $2, request_count = $3 WHERE client_key = $1',
        [clientKey, windowStart, nextCount]
      );
      return;
    }

    await client.query(
      'UPDATE session_create_rate_limits SET request_count = $2 WHERE client_key = $1',
      [clientKey, nextCount]
    );
  });
}

export async function resetSessionCreationRateLimits(client = getPool()) {
  await client.query('DELETE FROM session_create_rate_limits');
}
