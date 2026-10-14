import { getPool } from '../config/db.js';
import {
  findPaymentIdempotencyOrderId,
  insertPaymentIdempotencyKey,
} from '../repositories/paymentIdempotencyRepository.js';
import {
  loadOrderById,
  loadOrderByNumberAndSession,
  withTransaction,
} from '../repositories/orderRepository.js';
import { isPaymentPendingStale } from '../lib/paymentStatus.js';
import { PAYMENT_FAILURE_MESSAGE, resolvePaymentOutcome } from './paymentStub.js';

const PAYMENT_PENDING_ABORT_MESSAGE = '付款逾時已中止';

function idempotencyTtlMs() {
  return Number(process.env.IDEMPOTENCY_TTL_MS || 86_400_000);
}

function clientError(code, status, message) {
  const error = new Error(code);
  error.code = code;
  error.status = status;
  error.message = message;
  return error;
}

async function loadOwnedOrder(sessionId, orderNumber) {
  const order = await loadOrderByNumberAndSession(sessionId, orderNumber);
  if (!order) {
    throw clientError('ORDER_NOT_FOUND', 404, '找不到訂單。');
  }
  return order;
}

async function replayPaidIdempotency(sessionId, orderNumber, idempotencyKey, client = getPool()) {
  const existingOrderId = await findPaymentIdempotencyOrderId(sessionId, idempotencyKey, client);
  if (!existingOrderId) {
    return null;
  }
  const replay = await loadOrderById(existingOrderId, client);
  if (!replay) {
    return null;
  }
  if (replay.order_number !== orderNumber) {
    throw clientError(
      'IDEMPOTENCY_KEY_ORDER_MISMATCH',
      409,
      '此 Idempotency-Key 已用於另一筆訂單的付款。',
    );
  }
  return replay;
}

function isDuplicateIdempotencyKeyError(error) {
  if (!error) {
    return false;
  }
  const code = error.code ?? error.number;
  return code === 'DUPLICATE_IDEMPOTENCY_KEY' || code === 2627 || code === 2601;
}

export async function payOrderForSession(sessionId, orderNumber, { idempotencyKey, simulateOutcome } = {}) {
  if (idempotencyKey) {
    const replay = await replayPaidIdempotency(sessionId, orderNumber, idempotencyKey);
    if (replay) {
      return { replay: true, order: replay };
    }
  }

  const order = await loadOwnedOrder(sessionId, orderNumber);

  if (order.status === 'cancelled') {
    throw clientError('ORDER_CANCELLED', 409, '訂單已取消，無法付款。');
  }
  if (order.payment_status === 'paid') {
    throw clientError('ORDER_ALREADY_PAID', 409, '訂單已付款。');
  }
  if (order.payment_status === 'pending' && !isPaymentPendingStale(order.payment_status_updated_at)) {
    throw clientError('PAYMENT_IN_PROGRESS', 409, '付款處理中，請稍後再試。');
  }
  if (!['unpaid', 'failed', 'pending'].includes(order.payment_status)) {
    throw clientError('PAYMENT_IN_PROGRESS', 409, '付款狀態不允許此操作。');
  }

  const outcome = resolvePaymentOutcome({ simulateOutcome });

  const updated = await withTransaction(async (client) => {
    const lock = await client.query(
      `UPDATE orders
       SET payment_status = 'pending', payment_status_updated_at = SYSUTCDATETIME()
       WHERE order_number = $1
         AND guest_session_id = $2
         AND status <> 'cancelled'
         AND (
           payment_status IN ('unpaid', 'failed')
           OR (payment_status = 'pending')
         )`,
      [orderNumber, sessionId]
    );
    if ((lock.rowCount ?? 0) < 1) {
      if (idempotencyKey) {
        const replay = await replayPaidIdempotency(sessionId, orderNumber, idempotencyKey, client);
        if (replay) {
          return replay;
        }
      }
      throw clientError('PAYMENT_IN_PROGRESS', 409, '付款狀態已變更，請稍後再試。');
    }

    if (process.env.PAYMENT_TEST_ABORT_AFTER_PENDING === '1') {
      throw clientError('INTERNAL_ERROR', 500, '模擬付款中斷');
    }

    if (outcome === 'failure') {
      await client.query(
        `UPDATE orders
         SET payment_status = 'failed',
             payment_status_updated_at = SYSUTCDATETIME(),
             payment_failed_at = SYSUTCDATETIME(),
             payment_failure_reason = $3
         WHERE order_number = $1 AND guest_session_id = $2`,
        [orderNumber, sessionId, PAYMENT_FAILURE_MESSAGE]
      );
    } else {
      await client.query(
        `UPDATE orders
         SET payment_status = 'paid',
             payment_status_updated_at = SYSUTCDATETIME(),
             paid_at = SYSUTCDATETIME(),
             payment_failure_reason = NULL
         WHERE order_number = $1 AND guest_session_id = $2`,
        [orderNumber, sessionId]
      );

      if (idempotencyKey) {
        const header = await client.query(
          'SELECT id FROM orders WHERE order_number = $1 AND guest_session_id = $2',
          [orderNumber, sessionId]
        );
        const orderId = header.rows[0]?.id;
        if (orderId) {
          const expiresAt = new Date(Date.now() + idempotencyTtlMs()).toISOString();
          try {
            await insertPaymentIdempotencyKey(sessionId, idempotencyKey, orderId, expiresAt, client);
          } catch (error) {
            if (isDuplicateIdempotencyKeyError(error)) {
              const replay = await replayPaidIdempotency(sessionId, orderNumber, idempotencyKey, client);
              if (replay) {
                return replay;
              }
            }
            throw error;
          }
        }
      }
    }

    return loadOrderByNumberAndSession(sessionId, orderNumber, client);
  });

  return { replay: false, order: updated };
}

export async function cancelOrderForSession(sessionId, orderNumber) {
  const order = await loadOwnedOrder(sessionId, orderNumber);

  if (order.status === 'cancelled') {
    throw clientError('ORDER_CANCELLED', 409, '訂單已取消。');
  }
  if (order.status !== 'created') {
    throw clientError('ORDER_NOT_CANCELLABLE', 409, '目前狀態無法取消訂單。');
  }
  if (order.payment_status === 'pending' && !isPaymentPendingStale(order.payment_status_updated_at)) {
    throw clientError('PAYMENT_IN_PROGRESS', 409, '付款處理中，請稍後再試。');
  }

  const updated = await withTransaction(async (client) => {
    const result = await client.query(
      `UPDATE orders
       SET status = 'cancelled',
           cancelled_at = SYSUTCDATETIME(),
           status_updated_at = SYSUTCDATETIME(),
           payment_status = CASE
             WHEN payment_status = 'paid' THEN 'refunded'
             WHEN payment_status = 'pending' THEN 'failed'
             ELSE payment_status
           END,
           payment_status_updated_at = SYSUTCDATETIME(),
           refunded_at = CASE WHEN payment_status = 'paid' THEN SYSUTCDATETIME() ELSE refunded_at END,
           payment_failed_at = CASE WHEN payment_status = 'pending' THEN SYSUTCDATETIME() ELSE payment_failed_at END,
           payment_failure_reason = CASE WHEN payment_status = 'pending' THEN $3 ELSE payment_failure_reason END
       WHERE order_number = $1
         AND guest_session_id = $2
         AND status = 'created'`,
      [orderNumber, sessionId, PAYMENT_PENDING_ABORT_MESSAGE]
    );
    if ((result.rowCount ?? 0) < 1) {
      throw clientError('ORDER_NOT_CANCELLABLE', 409, '目前狀態無法取消訂單。');
    }
    return loadOrderByNumberAndSession(sessionId, orderNumber, client);
  });

  return updated;
}
