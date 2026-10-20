import crypto from 'node:crypto';
import { getPool } from '../config/db.js';

export async function ensureCartForSession(sessionId, client = getPool()) {
  const existing = await client.query(
    'SELECT id FROM carts WHERE guest_session_id = $1',
    [sessionId]
  );

  if (existing.rows[0]) {
    return existing.rows[0].id;
  }

  const cartId = crypto.randomUUID();
  await client.query(
    `INSERT INTO carts (id, guest_session_id, created_at, updated_at)
     VALUES ($1, $2, SYSUTCDATETIME(), SYSUTCDATETIME())`,
    [cartId, sessionId]
  );
  return cartId;
}

export async function loadCartRows(sessionId, client = getPool()) {
  const cartResult = await client.query(
    `SELECT c.id AS cart_id, ci.id AS item_id, ci.menu_item_id, ci.quantity,
            cio.option_group_id, cio.menu_item_option_id
     FROM carts c
     LEFT JOIN cart_items ci ON ci.cart_id = c.id
     LEFT JOIN cart_item_options cio ON cio.cart_item_id = ci.id
     WHERE c.guest_session_id = $1
     ORDER BY ci.created_at ASC, cio.option_group_id ASC`,
    [sessionId]
  );

  if (cartResult.rows.length === 0) {
    return [];
  }

  const items = new Map();
  for (const row of cartResult.rows) {
    if (!row.item_id) {
      continue;
    }

    if (!items.has(row.item_id)) {
      items.set(row.item_id, {
        id: row.item_id,
        menu_item_id: row.menu_item_id,
        quantity: row.quantity,
        menu_item_option_ids: [],
        option_pairs: [],
      });
    }

    if (row.menu_item_option_id) {
      const item = items.get(row.item_id);
      item.menu_item_option_ids.push(row.menu_item_option_id);
      item.option_pairs.push({
        option_group_id: row.option_group_id,
        menu_item_option_id: row.menu_item_option_id,
      });
    }
  }

  return [...items.values()];
}

export async function insertCartItem(sessionId, itemPayload, client = getPool()) {
  const cartId = await ensureCartForSession(sessionId, client);
  const itemId = crypto.randomUUID();

  await client.query(
    `INSERT INTO cart_items (id, cart_id, menu_item_id, quantity, created_at, updated_at)
     VALUES ($1, $2, $3, $4, SYSUTCDATETIME(), SYSUTCDATETIME())`,
    [itemId, cartId, itemPayload.menu_item_id, itemPayload.quantity]
  );

  for (const option of itemPayload.option_rows) {
    await client.query(
      `INSERT INTO cart_item_options (cart_item_id, menu_item_id, option_group_id, menu_item_option_id)
       VALUES ($1, $2, $3, $4)`,
      [itemId, itemPayload.menu_item_id, option.option_group_id, option.menu_item_option_id]
    );
  }

  return itemId;
}

export async function withTransaction(work, pool = getPool()) {
  const client = await pool.connect();
  const usesMssql = typeof client.commit === 'function';
  try {
    if (!usesMssql) {
      await client.query('BEGIN');
    }
    const result = await work(client);
    if (usesMssql) {
      await client.commit();
    } else {
      await client.query('COMMIT');
    }
    return result;
  } catch (error) {
    if (usesMssql) {
      await client.rollback();
    } else {
      await client.query('ROLLBACK');
    }
    throw error;
  } finally {
    if (typeof client.release === 'function') {
      client.release();
    }
  }
}

export async function updateCartItemQuantity(sessionId, itemId, quantity, client = getPool()) {
  const result = await client.query(
    `UPDATE ci
     SET quantity = $1, updated_at = SYSUTCDATETIME()
     FROM cart_items ci
     INNER JOIN carts c ON ci.cart_id = c.id
     WHERE ci.id = $2 AND c.guest_session_id = $3`,
    [quantity, itemId, sessionId]
  );
  return result.rowCount > 0;
}

export async function deleteCartItem(sessionId, itemId, client = getPool()) {
  const result = await client.query(
    `DELETE ci
     FROM cart_items ci
     INNER JOIN carts c ON ci.cart_id = c.id
     WHERE ci.id = $1 AND c.guest_session_id = $2`,
    [itemId, sessionId]
  );
  return result.rowCount > 0;
}

export async function cartExistsForSession(sessionId, client = getPool()) {
  const result = await client.query(
    'SELECT TOP 1 1 AS ok FROM carts WHERE guest_session_id = $1',
    [sessionId]
  );
  return result.rowCount > 0;
}

export async function lockCartForSession(sessionId, client = getPool()) {
  await client.query(
    'SELECT id FROM carts WITH (UPDLOCK, ROWLOCK) WHERE guest_session_id = $1',
    [sessionId]
  );
}
