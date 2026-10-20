import crypto from 'node:crypto';
import { getPool } from '../config/db.js';
import { statusLabelFor } from '../lib/orderStatus.js';
import { paymentStatusLabelFor } from '../lib/paymentStatus.js';
import { withTransaction } from './cartRepository.js';

const ORDER_HEADER_SELECT =
  'id, guest_session_id, order_number, status, payment_status, total_amount, created_at, status_updated_at, payment_status_updated_at, payment_failure_reason, paid_at, cancelled_at, refunded_at, payment_failed_at';

export async function findIdempotencyOrderId(sessionId, idempotencyKey, client = getPool()) {
  const result = await client.query(
    `SELECT order_id
     FROM order_idempotency_keys
     WHERE guest_session_id = $1
       AND idempotency_key = $2
       AND expires_at > SYSUTCDATETIME()`,
    [sessionId, idempotencyKey]
  );
  return result.rows[0]?.order_id ?? null;
}

export async function insertIdempotencyKey(sessionId, idempotencyKey, orderId, expiresAtIso, client) {
  await client.query(
    `INSERT INTO order_idempotency_keys (guest_session_id, idempotency_key, order_id, created_at, expires_at)
     VALUES ($1, $2, $3, SYSUTCDATETIME(), $4)`,
    [sessionId, idempotencyKey, orderId, expiresAtIso]
  );
}

export async function deleteExpiredIdempotencyKey(sessionId, idempotencyKey, client) {
  await client.query(
    `DELETE FROM order_idempotency_keys
     WHERE guest_session_id = $1
       AND idempotency_key = $2
       AND expires_at <= SYSUTCDATETIME()`,
    [sessionId, idempotencyKey]
  );
}

export async function insertOrderHeader(sessionId, orderNumber, totalAmount, client) {
  const orderId = crypto.randomUUID();
  await client.query(
    `INSERT INTO orders (id, guest_session_id, order_number, status, payment_status, total_amount, created_at, status_updated_at, payment_status_updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, SYSUTCDATETIME(), SYSUTCDATETIME(), SYSUTCDATETIME())`,
    [orderId, sessionId, orderNumber, 'created', 'unpaid', totalAmount]
  );
  return orderId;
}

export async function insertOrderItemRow(orderId, item, client) {
  const itemId = crypto.randomUUID();
  await client.query(
    `INSERT INTO order_items (id, order_id, menu_item_id, menu_item_name, quantity, unit_price, line_total)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      itemId,
      orderId,
      item.menu_item_id,
      item.menu_item_name,
      item.quantity,
      item.unit_price,
      item.line_total,
    ]
  );

  for (const option of item.options || []) {
    await client.query(
      `INSERT INTO order_item_options (order_item_id, option_group_id, option_group_name, menu_item_option_id, option_name)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        itemId,
        option.option_group_id,
        option.option_group_name,
        option.menu_item_option_id,
        option.option_name,
      ]
    );
  }

  return itemId;
}

export async function clearCartItemsForSession(sessionId, client) {
  await client.query(
    `DELETE cio
     FROM cart_item_options cio
     INNER JOIN cart_items ci ON cio.cart_item_id = ci.id
     INNER JOIN carts c ON ci.cart_id = c.id
     WHERE c.guest_session_id = $1`,
    [sessionId]
  );
  await client.query(
    `DELETE ci
     FROM cart_items ci
     INNER JOIN carts c ON ci.cart_id = c.id
     WHERE c.guest_session_id = $1`,
    [sessionId]
  );
}

export async function loadOrderByOrderNumber(orderNumber, client = getPool()) {
  const header = await client.query(
    `SELECT ${ORDER_HEADER_SELECT}
     FROM orders
     WHERE order_number = $1`,
    [orderNumber]
  );
  if (!header.rows[0]) {
    return null;
  }
  return assembleOrder(header.rows[0], client);
}

export async function loadOrderById(orderId, client = getPool()) {
  const header = await client.query(
    `SELECT ${ORDER_HEADER_SELECT}
     FROM orders
     WHERE id = $1`,
    [orderId]
  );
  if (!header.rows[0]) {
    return null;
  }

  return assembleOrder(header.rows[0], client);
}

export async function loadOrderByNumberAndSession(sessionId, orderNumber, client = getPool()) {
  const header = await client.query(
    `SELECT ${ORDER_HEADER_SELECT}
     FROM orders
     WHERE order_number = $1 AND guest_session_id = $2`,
    [orderNumber, sessionId]
  );
  if (!header.rows[0]) {
    return null;
  }

  return assembleOrder(header.rows[0], client);
}

async function assembleOrder(headerRow, client) {
  const itemsResult = await client.query(
    `SELECT id, menu_item_id, menu_item_name, quantity, unit_price, line_total
     FROM order_items
     WHERE order_id = $1
     ORDER BY menu_item_name ASC`,
    [headerRow.id]
  );

  const optionsResult = await client.query(
    `SELECT oio.order_item_id, oio.option_group_id, oio.option_group_name, oio.menu_item_option_id, oio.option_name
     FROM order_item_options oio
     INNER JOIN order_items oi ON oio.order_item_id = oi.id
     WHERE oi.order_id = $1
     ORDER BY oi.menu_item_name ASC, oio.option_group_id ASC`,
    [headerRow.id]
  );

  const optionsByItemId = new Map();
  for (const option of optionsResult.rows) {
    if (!optionsByItemId.has(option.order_item_id)) {
      optionsByItemId.set(option.order_item_id, []);
    }
    optionsByItemId.get(option.order_item_id).push({
      option_group_id: option.option_group_id,
      option_group_name: option.option_group_name,
      menu_item_option_id: option.menu_item_option_id,
      name: option.option_name,
    });
  }

  const items = itemsResult.rows.map((row) => ({
    menu_item_id: row.menu_item_id,
    menu_item_name: row.menu_item_name,
    quantity: row.quantity,
    unit_price: formatDecimal(row.unit_price),
    line_total: formatDecimal(row.line_total),
    options: optionsByItemId.get(row.id) ?? [],
  }));

  const paymentStatus = headerRow.payment_status ?? 'unpaid';

  return {
    order_number: headerRow.order_number,
    status: headerRow.status,
    status_label: statusLabelFor(headerRow.status),
    payment_status: paymentStatus,
    payment_status_label: paymentStatusLabelFor(paymentStatus),
    payment_failure_reason: headerRow.payment_failure_reason ?? null,
    created_at: normalizeTimestamp(headerRow.created_at),
    status_updated_at: headerRow.status_updated_at
      ? normalizeTimestamp(headerRow.status_updated_at)
      : normalizeTimestamp(headerRow.created_at),
    payment_status_updated_at: headerRow.payment_status_updated_at
      ? normalizeTimestamp(headerRow.payment_status_updated_at)
      : normalizeTimestamp(headerRow.created_at),
    paid_at: headerRow.paid_at ? normalizeTimestamp(headerRow.paid_at) : null,
    cancelled_at: headerRow.cancelled_at ? normalizeTimestamp(headerRow.cancelled_at) : null,
    refunded_at: headerRow.refunded_at ? normalizeTimestamp(headerRow.refunded_at) : null,
    total: formatDecimal(headerRow.total_amount),
    items,
  };
}

export async function listOrdersForMerchant(
  { status = null, paymentStatus = null, limit = 200 },
  client = getPool()
) {
  let result;
  if (status && paymentStatus) {
    result = await client.query(
      `SELECT order_number, status, payment_status, total_amount, created_at, status_updated_at
       FROM orders
       WHERE status = $1 AND payment_status = $2
       ORDER BY created_at DESC`,
      [status, paymentStatus]
    );
  } else if (status) {
    result = await client.query(
      `SELECT order_number, status, payment_status, total_amount, created_at, status_updated_at
       FROM orders
       WHERE status = $1
       ORDER BY created_at DESC`,
      [status]
    );
  } else if (paymentStatus) {
    result = await client.query(
      `SELECT order_number, status, payment_status, total_amount, created_at, status_updated_at
       FROM orders
       WHERE payment_status = $1
       ORDER BY created_at DESC`,
      [paymentStatus]
    );
  } else {
    result = await client.query(
      `SELECT order_number, status, payment_status, total_amount, created_at, status_updated_at
       FROM orders
       ORDER BY created_at DESC`,
      []
    );
  }

  const rows = result.rows.slice(0, limit);
  return rows.map((row) => {
    const ps = row.payment_status ?? 'unpaid';
    return {
      order_number: row.order_number,
      status: row.status,
      status_label: statusLabelFor(row.status),
      payment_status: ps,
      payment_status_label: paymentStatusLabelFor(ps),
      created_at: normalizeTimestamp(row.created_at),
      status_updated_at: row.status_updated_at
        ? normalizeTimestamp(row.status_updated_at)
        : normalizeTimestamp(row.created_at),
      total: formatDecimal(row.total_amount),
    };
  });
}

export async function transitionOrderStatus(orderNumber, expectedStatus, nextStatus, client = getPool()) {
  const result = await client.query(
    `UPDATE orders
     SET status = $3, status_updated_at = SYSUTCDATETIME()
     WHERE order_number = $1 AND status = $2`,
    [orderNumber, expectedStatus, nextStatus]
  );
  if ((result.rowCount ?? 0) < 1) {
    return null;
  }
  return loadOrderByOrderNumber(orderNumber, client);
}

function formatDecimal(value) {
  if (typeof value === 'string') {
    return value.includes('.') ? value : `${value}.00`;
  }
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  return String(value ?? '0.00');
}

function normalizeTimestamp(value) {
  if (!value) {
    return new Date().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  const text = String(value);
  if (text.endsWith('Z') || text.includes('+')) {
    return new Date(text).toISOString();
  }
  return `${text.replace(' ', 'T')}Z`;
}

export async function deleteExpiredIdempotencyKeys(beforeIso, client = getPool()) {
  const result = await client.query(
    'DELETE FROM order_idempotency_keys WHERE expires_at <= $1',
    [beforeIso]
  );
  return result.rowCount ?? 0;
}

export async function runOrderCreationTransaction(sessionId, idempotencyKey, work) {
  return withTransaction(async (client) => work(client));
}

export { withTransaction };
