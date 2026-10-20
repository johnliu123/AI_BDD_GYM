import { getPool } from '../config/db.js';

export async function findPaymentIdempotencyOrderId(sessionId, idempotencyKey, client = getPool()) {
  const result = await client.query(
    `SELECT order_id
     FROM payment_idempotency_keys
     WHERE guest_session_id = $1
       AND idempotency_key = $2
       AND expires_at > SYSUTCDATETIME()`,
    [sessionId, idempotencyKey]
  );
  return result.rows[0]?.order_id ?? null;
}

export async function deleteExpiredPaymentIdempotencyKey(sessionId, idempotencyKey, client) {
  await client.query(
    `DELETE FROM payment_idempotency_keys
     WHERE guest_session_id = $1
       AND idempotency_key = $2
       AND expires_at <= SYSUTCDATETIME()`,
    [sessionId, idempotencyKey]
  );
}

export async function insertPaymentIdempotencyKey(
  sessionId,
  idempotencyKey,
  orderId,
  expiresAtIso,
  client
) {
  await client.query(
    `INSERT INTO payment_idempotency_keys (guest_session_id, idempotency_key, order_id, result_payment_status, created_at, expires_at)
     VALUES ($1, $2, $3, $4, SYSUTCDATETIME(), $5)`,
    [sessionId, idempotencyKey, orderId, 'paid', expiresAtIso]
  );
}
