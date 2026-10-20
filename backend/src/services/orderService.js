import crypto from 'node:crypto';
import { loadCartRows, lockCartForSession } from '../repositories/cartRepository.js';
import { buildCartState } from './cartPricing.js';
import {
  clearCartItemsForSession,
  deleteExpiredIdempotencyKey,
  findIdempotencyOrderId,
  insertIdempotencyKey,
  insertOrderHeader,
  insertOrderItemRow,
  loadOrderById,
  loadOrderByNumberAndSession,
  runOrderCreationTransaction,
} from '../repositories/orderRepository.js';

const MAX_ORDER_NUMBER_ATTEMPTS = 5;

/** Serializes create-order work per session to avoid duplicate orders without Idempotency-Key (single-process). */
const sessionCreateChains = new Map();

function idempotencyTtlMs() {
  return Number(process.env.IDEMPOTENCY_TTL_MS || 86_400_000);
}

export function generateOrderNumber(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `ORD-${year}${month}${day}-${suffix}`;
}

function validateCartForOrder(cartState) {
  const items = cartState.items || [];
  const available = items.filter((item) => item.availability === 'available');
  const unavailable = items.filter((item) => item.availability === 'unavailable');

  if (available.length === 0) {
    const error = new Error('CART_EMPTY');
    error.code = 'CART_EMPTY';
    error.status = 400;
    throw error;
  }

  if (unavailable.length > 0) {
    const error = new Error('CART_HAS_UNAVAILABLE_ITEMS');
    error.code = 'CART_HAS_UNAVAILABLE_ITEMS';
    error.status = 409;
    throw error;
  }

  return available;
}

function mapCartLineToOrderItem(line) {
  return {
    menu_item_id: line.menu_item_id,
    menu_item_name: line.menu_item_name,
    quantity: line.quantity,
    unit_price: line.unit_price,
    line_total: line.line_total,
    options: (line.options || []).map((option) => ({
      option_group_id: option.option_group_id,
      option_group_name: option.option_group_name,
      menu_item_option_id: option.option_id,
      option_name: option.option_name,
    })),
  };
}

async function readCartSnapshot(sessionId, client) {
  const rows = await loadCartRows(sessionId, client);
  return buildCartState(rows);
}

async function withSessionCreateMutex(sessionId, work) {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const previous = sessionCreateChains.get(sessionId) ?? Promise.resolve();
  sessionCreateChains.set(sessionId, previous.then(() => gate));
  await previous;
  try {
    return await work();
  } finally {
    release();
  }
}

export function toOrderResponse(order) {
  return { order };
}

async function findReplayOrder(sessionId, idempotencyKey) {
  if (!idempotencyKey) {
    return null;
  }
  const existingOrderId = await findIdempotencyOrderId(sessionId, idempotencyKey);
  if (!existingOrderId) {
    return null;
  }
  const existing = await loadOrderById(existingOrderId);
  if (!existing) {
    return null;
  }
  return { replay: true, order: existing };
}

export async function createOrderFromCart(sessionId, idempotencyKey) {
  const earlyReplay = await findReplayOrder(sessionId, idempotencyKey);
  if (earlyReplay) {
    return earlyReplay;
  }

  return await withSessionCreateMutex(sessionId, async () => {
    const mutexReplay = await findReplayOrder(sessionId, idempotencyKey);
    if (mutexReplay) {
      return mutexReplay;
    }

    let createdOrder = null;
    let lastCollision = null;

    for (let attempt = 0; attempt < MAX_ORDER_NUMBER_ATTEMPTS; attempt += 1) {
      const orderNumber = generateOrderNumber();
      try {
        createdOrder = await runOrderCreationTransaction(sessionId, idempotencyKey, async (client) => {
          await lockCartForSession(sessionId, client);
          const cartState = await readCartSnapshot(sessionId, client);
          const availableLines = validateCartForOrder(cartState);
          const orderLines = availableLines.map(mapCartLineToOrderItem);
          const total = cartState.total;

          const orderId = await insertOrderHeader(sessionId, orderNumber, total, client);
          for (const line of orderLines) {
            await insertOrderItemRow(orderId, line, client);
          }
          await clearCartItemsForSession(sessionId, client);
          if (idempotencyKey) {
            await deleteExpiredIdempotencyKey(sessionId, idempotencyKey, client);
            const expiresAt = new Date(Date.now() + idempotencyTtlMs()).toISOString();
            await insertIdempotencyKey(sessionId, idempotencyKey, orderId, expiresAt, client);
          }
          return loadOrderById(orderId, client);
        });
        break;
      } catch (error) {
        if (error.code === 'ORDER_NUMBER_COLLISION' || error.message?.includes('UNIQUE')) {
          lastCollision = error;
          continue;
        }
        throw error;
      }
    }

    if (!createdOrder) {
      const error = lastCollision || new Error('ORDER_NUMBER_GENERATION_FAILED');
      error.code = 'INTERNAL_ERROR';
      error.status = 500;
      throw error;
    }

    return { replay: false, order: createdOrder };
  });
}

export async function getOrderForSession(sessionId, orderNumber) {
  const order = await loadOrderByNumberAndSession(sessionId, orderNumber);
  if (!order) {
    const error = new Error('ORDER_NOT_FOUND');
    error.code = 'ORDER_NOT_FOUND';
    error.status = 404;
    throw error;
  }
  return order;
}

export function resetSessionCreateMutexForTests() {
  sessionCreateChains.clear();
}
