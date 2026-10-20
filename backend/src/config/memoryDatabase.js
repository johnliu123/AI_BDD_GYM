import crypto from 'node:crypto';
import { tryExecuteMenuQuery } from './menuMemorySql.js';
import { seedMenuCatalogIntoMemoryState } from '../data/menuCatalogSeed.js';

function nowIso() {
  return new Date().toISOString();
}

function normalizeSql(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function createEmptyState() {
  return {
    guest_sessions: new Map(),
    carts: new Map(),
    cart_items: new Map(),
    cart_item_options: [],
    session_create_rate_limits: new Map(),
    orders: new Map(),
    order_items: new Map(),
    order_item_options: [],
    order_idempotency_keys: new Map(),
    payment_idempotency_keys: new Map(),
    categories: new Map(),
    menu_items: new Map(),
    menu_item_option_groups: new Map(),
    menu_item_options: new Map(),
  };
}

let sharedState = createEmptyState();

function cloneMapRecords(map) {
  return new Map([...map.entries()].map(([key, value]) => [key, { ...value }]));
}

function cloneState(state) {
  return {
    guest_sessions: cloneMapRecords(state.guest_sessions),
    carts: cloneMapRecords(state.carts),
    cart_items: cloneMapRecords(state.cart_items),
    cart_item_options: state.cart_item_options.map((row) => ({ ...row })),
    session_create_rate_limits: cloneMapRecords(state.session_create_rate_limits),
    orders: cloneMapRecords(state.orders),
    order_items: cloneMapRecords(state.order_items),
    order_item_options: state.order_item_options.map((row) => ({ ...row })),
    order_idempotency_keys: cloneMapRecords(state.order_idempotency_keys),
    payment_idempotency_keys: cloneMapRecords(state.payment_idempotency_keys),
    categories: cloneMapRecords(state.categories),
    menu_items: cloneMapRecords(state.menu_items),
    menu_item_option_groups: cloneMapRecords(state.menu_item_option_groups),
    menu_item_options: cloneMapRecords(state.menu_item_options),
  };
}

const ORDER_HEADER_SELECT =
  'id, guest_session_id, order_number, status, payment_status, total_amount, created_at, status_updated_at, payment_status_updated_at, payment_failure_reason, paid_at, cancelled_at, refunded_at, payment_failed_at';

function defaultPaymentFields(ts) {
  return {
    payment_status: 'unpaid',
    payment_status_updated_at: ts,
    payment_failure_reason: null,
    paid_at: null,
    cancelled_at: null,
    refunded_at: null,
    payment_failed_at: null,
  };
}

function findOrderByNumber(state, orderNumber) {
  return [...state.orders.values()].find((entry) => entry.order_number === orderNumber);
}

function findOrderByNumberAndSession(state, orderNumber, sessionId) {
  return [...state.orders.values()].find(
    (entry) => entry.order_number === orderNumber && entry.guest_session_id === sessionId
  );
}

function mapMerchantListRow(entry) {
  return {
    order_number: entry.order_number,
    status: entry.status,
    payment_status: entry.payment_status ?? 'unpaid',
    total_amount: entry.total_amount,
    created_at: entry.created_at,
    status_updated_at: entry.status_updated_at ?? entry.created_at,
  };
}

function executeQuery(state, text, params = []) {
  const sql = normalizeSql(text);

  if (sql.startsWith('CREATE TABLE') || sql.startsWith('CREATE INDEX')) {
    return { rows: [], rowCount: 0 };
  }

  if (sql === 'DELETE FROM cart_item_options') {
    state.cart_item_options = [];
    return { rows: [], rowCount: 0 };
  }
  if (sql === 'DELETE FROM cart_items') {
    state.cart_items.clear();
    return { rows: [], rowCount: 0 };
  }
  if (sql === 'DELETE FROM carts') {
    state.carts.clear();
    return { rows: [], rowCount: 0 };
  }
  if (sql === 'DELETE FROM guest_sessions') {
    state.guest_sessions.clear();
    return { rows: [], rowCount: 0 };
  }
  if (sql === 'DELETE FROM payment_idempotency_keys') {
    state.payment_idempotency_keys.clear();
    return { rows: [], rowCount: 0 };
  }
  if (sql === 'DELETE FROM order_idempotency_keys') {
    state.order_idempotency_keys.clear();
    return { rows: [], rowCount: 0 };
  }
  if (sql === 'DELETE FROM order_item_options') {
    state.order_item_options = [];
    return { rows: [], rowCount: 0 };
  }
  if (sql === 'DELETE FROM order_items') {
    state.order_items.clear();
    return { rows: [], rowCount: 0 };
  }
  if (sql === 'DELETE FROM orders') {
    state.orders.clear();
    return { rows: [], rowCount: 0 };
  }

  if (sql === 'SELECT COUNT(*) AS count FROM guest_sessions') {
    return { rows: [{ count: state.guest_sessions.size }], rowCount: 1 };
  }

  if (sql === 'SELECT COUNT(*) AS count FROM payment_idempotency_keys') {
    return { rows: [{ count: state.payment_idempotency_keys.size }], rowCount: 1 };
  }

  if (
    sql
    === 'UPDATE orders SET payment_status = $3, payment_status_updated_at = $4 WHERE order_number = $1 AND guest_session_id = $2'
  ) {
    const row = findOrderByNumberAndSession(state, params[0], params[1]);
    if (!row) {
      return { rows: [], rowCount: 0 };
    }
    row.payment_status = params[2];
    row.payment_status_updated_at = params[3];
    return { rows: [], rowCount: 1 };
  }

  if (sql === 'SELECT COUNT(*) AS count FROM carts') {
    return { rows: [{ count: state.carts.size }], rowCount: 1 };
  }

  if (sql === 'SELECT session_id, csrf_token, created_at, last_activity_at FROM guest_sessions WHERE session_id = $1') {
    const row = state.guest_sessions.get(params[0]);
    return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
  }

  if (sql.startsWith('DELETE FROM guest_sessions WHERE session_id = $1 AND NOT EXISTS')) {
    const sessionId = params[0];
    const referenced =
      [...state.orders.values()].some((row) => row.guest_session_id === sessionId)
      || [...state.order_idempotency_keys.values()].some((row) => row.guest_session_id === sessionId)
      || [...state.payment_idempotency_keys.values()].some((row) => row.guest_session_id === sessionId);
    if (referenced) {
      return { rows: [], rowCount: 0 };
    }
    const existed = state.guest_sessions.delete(sessionId);
    return { rows: [], rowCount: existed ? 1 : 0 };
  }

  if (sql === 'DELETE FROM guest_sessions WHERE session_id = $1') {
    const existed = state.guest_sessions.delete(params[0]);
    return { rows: [], rowCount: existed ? 1 : 0 };
  }

  if (sql === 'UPDATE guest_sessions SET last_activity_at = SYSUTCDATETIME() WHERE session_id = $1') {
    const row = state.guest_sessions.get(params[0]);
    if (row) {
      row.last_activity_at = nowIso();
    }
    return { rows: [], rowCount: row ? 1 : 0 };
  }

  if (sql === 'SELECT session_id, created_at, last_activity_at FROM guest_sessions') {
    return {
      rows: [...state.guest_sessions.values()].map((row) => ({
        session_id: row.session_id,
        created_at: row.created_at,
        last_activity_at: row.last_activity_at,
      })),
      rowCount: state.guest_sessions.size,
    };
  }

  if (
    sql
    === 'INSERT INTO guest_sessions (session_id, csrf_token, created_at, last_activity_at) VALUES ($1, $2, SYSUTCDATETIME(), SYSUTCDATETIME())'
  ) {
    const ts = nowIso();
    state.guest_sessions.set(params[0], {
      session_id: params[0],
      csrf_token: params[1],
      created_at: ts,
      last_activity_at: ts,
    });
    return { rows: [], rowCount: 1 };
  }

  if (sql === 'UPDATE guest_sessions SET last_activity_at = $2, created_at = $2 WHERE session_id = $1') {
    const row = state.guest_sessions.get(params[0]);
    if (row) {
      row.created_at = params[1];
      row.last_activity_at = params[1];
    }
    return { rows: [], rowCount: row ? 1 : 0 };
  }

  if (sql === 'SELECT id FROM carts WHERE guest_session_id = $1') {
    const cart = [...state.carts.values()].find((entry) => entry.guest_session_id === params[0]);
    return { rows: cart ? [{ id: cart.id }] : [], rowCount: cart ? 1 : 0 };
  }

  if (sql === 'SELECT id FROM carts WITH (UPDLOCK, ROWLOCK) WHERE guest_session_id = $1') {
    const cart = [...state.carts.values()].find((entry) => entry.guest_session_id === params[0]);
    return { rows: cart ? [{ id: cart.id }] : [], rowCount: cart ? 1 : 0 };
  }

  if (
    sql
    === 'INSERT INTO carts (id, guest_session_id, created_at, updated_at) VALUES ($1, $2, SYSUTCDATETIME(), SYSUTCDATETIME())'
  ) {
    const ts = nowIso();
    state.carts.set(params[0], {
      id: params[0],
      guest_session_id: params[1],
      created_at: ts,
      updated_at: ts,
    });
    return { rows: [], rowCount: 1 };
  }

  if (
    sql.startsWith(
      'SELECT c.id AS cart_id, ci.id AS item_id, ci.menu_item_id, ci.quantity, cio.option_group_id, cio.menu_item_option_id FROM carts c'
    )
  ) {
    const sessionId = params[0];
    const cart = [...state.carts.values()].find((entry) => entry.guest_session_id === sessionId);
    if (!cart) {
      return { rows: [], rowCount: 0 };
    }

    const rows = [];
    const items = [...state.cart_items.values()]
      .filter((item) => item.cart_id === cart.id)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));

    for (const item of items) {
      const options = state.cart_item_options
        .filter((option) => option.cart_item_id === item.id)
        .sort((a, b) => a.option_group_id.localeCompare(b.option_group_id));

      if (options.length === 0) {
        rows.push({
          cart_id: cart.id,
          item_id: item.id,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          option_group_id: null,
          menu_item_option_id: null,
        });
        continue;
      }

      for (const option of options) {
        rows.push({
          cart_id: cart.id,
          item_id: item.id,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          option_group_id: option.option_group_id,
          menu_item_option_id: option.menu_item_option_id,
        });
      }
    }

    return { rows, rowCount: rows.length };
  }

  if (
    sql
    === 'INSERT INTO cart_items (id, cart_id, menu_item_id, quantity, created_at, updated_at) VALUES ($1, $2, $3, $4, SYSUTCDATETIME(), SYSUTCDATETIME())'
  ) {
    const ts = nowIso();
    state.cart_items.set(params[0], {
      id: params[0],
      cart_id: params[1],
      menu_item_id: params[2],
      quantity: params[3],
      created_at: ts,
      updated_at: ts,
    });
    return { rows: [], rowCount: 1 };
  }

  if (
    sql
    === 'INSERT INTO cart_item_options (cart_item_id, menu_item_id, option_group_id, menu_item_option_id) VALUES ($1, $2, $3, $4)'
  ) {
    state.cart_item_options.push({
      cart_item_id: params[0],
      menu_item_id: params[1],
      option_group_id: params[2],
      menu_item_option_id: params[3],
    });
    return { rows: [], rowCount: 1 };
  }

  if (
    sql.startsWith(
      'UPDATE ci SET quantity = $1, updated_at = SYSUTCDATETIME() FROM cart_items ci INNER JOIN carts c ON ci.cart_id = c.id WHERE ci.id = $2 AND c.guest_session_id = $3'
    )
  ) {
    const item = state.cart_items.get(params[1]);
    if (!item) {
      return { rows: [], rowCount: 0 };
    }
    const cart = state.carts.get(item.cart_id);
    if (!cart || cart.guest_session_id !== params[2]) {
      return { rows: [], rowCount: 0 };
    }
    item.quantity = params[0];
    item.updated_at = nowIso();
    return { rows: [{ id: item.id }], rowCount: 1 };
  }

  if (
    sql.startsWith(
      'DELETE ci FROM cart_items ci INNER JOIN carts c ON ci.cart_id = c.id WHERE ci.id = $1 AND c.guest_session_id = $2'
    )
  ) {
    const item = state.cart_items.get(params[0]);
    if (!item) {
      return { rows: [], rowCount: 0 };
    }
    const cart = state.carts.get(item.cart_id);
    if (!cart || cart.guest_session_id !== params[1]) {
      return { rows: [], rowCount: 0 };
    }
    state.cart_items.delete(params[0]);
    state.cart_item_options = state.cart_item_options.filter((row) => row.cart_item_id !== params[0]);
    return { rows: [{ id: params[0] }], rowCount: 1 };
  }

  if (sql === 'SELECT TOP 1 1 AS ok FROM carts WHERE guest_session_id = $1') {
    const cart = [...state.carts.values()].find((entry) => entry.guest_session_id === params[0]);
    return { rows: cart ? [{ ok: 1 }] : [], rowCount: cart ? 1 : 0 };
  }

  if (
    sql
    === 'DELETE FROM carts WHERE guest_session_id NOT IN (SELECT session_id FROM guest_sessions)'
  ) {
    const liveSessions = new Set([...state.guest_sessions.keys()]);
    const removed = [];
    for (const [id, cart] of state.carts.entries()) {
      if (!liveSessions.has(cart.guest_session_id)) {
        state.carts.delete(id);
        for (const [itemId, item] of [...state.cart_items.entries()]) {
          if (item.cart_id === id) {
            state.cart_items.delete(itemId);
            state.cart_item_options = state.cart_item_options.filter((row) => row.cart_item_id !== itemId);
          }
        }
        removed.push({ id });
      }
    }
    return { rows: removed, rowCount: removed.length };
  }

  if (sql === 'DELETE FROM session_create_rate_limits') {
    state.session_create_rate_limits.clear();
    return { rows: [], rowCount: 0 };
  }

  if (
    sql
    === 'SELECT window_start_ms, request_count FROM session_create_rate_limits WHERE client_key = $1'
  ) {
    const row = state.session_create_rate_limits.get(params[0]);
    return {
      rows: row
        ? [{ window_start_ms: row.window_start_ms, request_count: row.request_count }]
        : [],
      rowCount: row ? 1 : 0,
    };
  }

  if (
    sql
    === 'INSERT INTO session_create_rate_limits (client_key, window_start_ms, request_count) VALUES ($1, $2, $3)'
  ) {
    state.session_create_rate_limits.set(params[0], {
      client_key: params[0],
      window_start_ms: params[1],
      request_count: params[2],
    });
    return { rows: [], rowCount: 1 };
  }

  if (
    sql
    === 'UPDATE session_create_rate_limits SET window_start_ms = $2, request_count = $3 WHERE client_key = $1'
  ) {
    state.session_create_rate_limits.set(params[0], {
      client_key: params[0],
      window_start_ms: params[1],
      request_count: params[2],
    });
    return { rows: [], rowCount: 1 };
  }

  if (sql === 'UPDATE session_create_rate_limits SET request_count = $2 WHERE client_key = $1') {
    const row = state.session_create_rate_limits.get(params[0]);
    if (!row) {
      return { rows: [], rowCount: 0 };
    }
    row.request_count = params[1];
    return { rows: [], rowCount: 1 };
  }

  if (
    sql
    === 'SELECT order_id FROM order_idempotency_keys WHERE guest_session_id = $1 AND idempotency_key = $2 AND expires_at > SYSUTCDATETIME()'
  ) {
    const key = `${params[0]}::${params[1]}`;
    const row = state.order_idempotency_keys.get(key);
    const now = Date.now();
    if (!row || Date.parse(row.expires_at) <= now) {
      return { rows: [], rowCount: 0 };
    }
    return { rows: [{ order_id: row.order_id }], rowCount: 1 };
  }

  if (
    sql
    === 'INSERT INTO order_idempotency_keys (guest_session_id, idempotency_key, order_id, created_at, expires_at) VALUES ($1, $2, $3, SYSUTCDATETIME(), $4)'
  ) {
    const mapKey = `${params[0]}::${params[1]}`;
    state.order_idempotency_keys.set(mapKey, {
      guest_session_id: params[0],
      idempotency_key: params[1],
      order_id: params[2],
      created_at: nowIso(),
      expires_at: params[3],
    });
    return { rows: [], rowCount: 1 };
  }

  if (
    sql
    === 'DELETE FROM order_idempotency_keys WHERE guest_session_id = $1 AND idempotency_key = $2 AND expires_at <= SYSUTCDATETIME()'
  ) {
    const mapKey = `${params[0]}::${params[1]}`;
    const row = state.order_idempotency_keys.get(mapKey);
    if (row && Date.parse(row.expires_at) <= Date.now()) {
      state.order_idempotency_keys.delete(mapKey);
      return { rows: [], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (
    sql
    === 'UPDATE order_idempotency_keys SET expires_at = $3 WHERE guest_session_id = $1 AND idempotency_key = $2'
  ) {
    const mapKey = `${params[0]}::${params[1]}`;
    const row = state.order_idempotency_keys.get(mapKey);
    if (!row) {
      return { rows: [], rowCount: 0 };
    }
    row.expires_at = params[2];
    return { rows: [], rowCount: 1 };
  }

  if (
    sql
    === 'INSERT INTO orders (id, guest_session_id, order_number, status, payment_status, total_amount, created_at, status_updated_at, payment_status_updated_at) VALUES ($1, $2, $3, $4, $5, $6, SYSUTCDATETIME(), SYSUTCDATETIME(), SYSUTCDATETIME())'
  ) {
    const duplicate = [...state.orders.values()].some((entry) => entry.order_number === params[2]);
    if (duplicate) {
      const error = new Error('UNIQUE constraint failed: orders.order_number');
      error.code = 'ORDER_NUMBER_COLLISION';
      throw error;
    }
    const ts = nowIso();
    state.orders.set(params[0], {
      id: params[0],
      guest_session_id: params[1],
      order_number: params[2],
      status: params[3],
      total_amount: params[5],
      created_at: ts,
      status_updated_at: ts,
      ...defaultPaymentFields(ts),
      payment_status: params[4],
      payment_status_updated_at: ts,
    });
    return { rows: [], rowCount: 1 };
  }

  if (
    sql
    === 'UPDATE orders SET status = $3, status_updated_at = SYSUTCDATETIME() WHERE order_number = $1 AND status = $2'
  ) {
    const row = [...state.orders.values()].find((entry) => entry.order_number === params[0]);
    if (!row || row.status !== params[1]) {
      return { rows: [], rowCount: 0 };
    }
    row.status = params[2];
    row.status_updated_at = nowIso();
    return { rows: [], rowCount: 1 };
  }

  if (
    sql
    === 'SELECT order_number, status, payment_status, total_amount, created_at, status_updated_at FROM orders WHERE status = $1 AND payment_status = $2 ORDER BY created_at DESC'
  ) {
    const rows = [...state.orders.values()]
      .filter(
        (entry) =>
          entry.status === params[0] && (entry.payment_status ?? 'unpaid') === params[1]
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map(mapMerchantListRow);
    return { rows, rowCount: rows.length };
  }

  if (
    sql
    === 'SELECT order_number, status, payment_status, total_amount, created_at, status_updated_at FROM orders WHERE status = $1 ORDER BY created_at DESC'
  ) {
    const rows = [...state.orders.values()]
      .filter((entry) => entry.status === params[0])
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map(mapMerchantListRow);
    return { rows, rowCount: rows.length };
  }

  if (
    sql
    === 'SELECT order_number, status, payment_status, total_amount, created_at, status_updated_at FROM orders WHERE payment_status = $1 ORDER BY created_at DESC'
  ) {
    const rows = [...state.orders.values()]
      .filter((entry) => (entry.payment_status ?? 'unpaid') === params[0])
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map(mapMerchantListRow);
    return { rows, rowCount: rows.length };
  }

  if (
    sql
    === 'SELECT order_number, status, payment_status, total_amount, created_at, status_updated_at FROM orders ORDER BY created_at DESC'
  ) {
    const rows = [...state.orders.values()]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map(mapMerchantListRow);
    return { rows, rowCount: rows.length };
  }

  if (
    sql
    === 'INSERT INTO order_items (id, order_id, menu_item_id, menu_item_name, quantity, unit_price, line_total) VALUES ($1, $2, $3, $4, $5, $6, $7)'
  ) {
    state.order_items.set(params[0], {
      id: params[0],
      order_id: params[1],
      menu_item_id: params[2],
      menu_item_name: params[3],
      quantity: params[4],
      unit_price: params[5],
      line_total: params[6],
    });
    return { rows: [], rowCount: 1 };
  }

  if (
    sql
    === 'INSERT INTO order_item_options (order_item_id, option_group_id, option_group_name, menu_item_option_id, option_name) VALUES ($1, $2, $3, $4, $5)'
  ) {
    state.order_item_options.push({
      order_item_id: params[0],
      option_group_id: params[1],
      option_group_name: params[2],
      menu_item_option_id: params[3],
      option_name: params[4],
    });
    return { rows: [], rowCount: 1 };
  }

  if (
    sql.startsWith(
      'DELETE cio FROM cart_item_options cio INNER JOIN cart_items ci ON cio.cart_item_id = ci.id INNER JOIN carts c ON ci.cart_id = c.id WHERE c.guest_session_id = $1'
    )
  ) {
    const sessionId = params[0];
    const cart = [...state.carts.values()].find((entry) => entry.guest_session_id === sessionId);
    if (!cart) {
      return { rows: [], rowCount: 0 };
    }
    const itemIds = new Set(
      [...state.cart_items.values()].filter((item) => item.cart_id === cart.id).map((item) => item.id)
    );
    state.cart_item_options = state.cart_item_options.filter((row) => !itemIds.has(row.cart_item_id));
    return { rows: [], rowCount: itemIds.size };
  }

  if (
    sql.startsWith(
      'DELETE ci FROM cart_items ci INNER JOIN carts c ON ci.cart_id = c.id WHERE c.guest_session_id = $1'
    )
  ) {
    const sessionId = params[0];
    const cart = [...state.carts.values()].find((entry) => entry.guest_session_id === sessionId);
    if (!cart) {
      return { rows: [], rowCount: 0 };
    }
    let removed = 0;
    for (const [itemId, item] of [...state.cart_items.entries()]) {
      if (item.cart_id === cart.id) {
        state.cart_items.delete(itemId);
        removed += 1;
      }
    }
    return { rows: [], rowCount: removed };
  }

  if (sql === `SELECT ${ORDER_HEADER_SELECT} FROM orders WHERE id = $1`) {
    const row = state.orders.get(params[0]);
    return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
  }

  if (sql === `SELECT ${ORDER_HEADER_SELECT} FROM orders WHERE order_number = $1`) {
    const row = findOrderByNumber(state, params[0]);
    return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
  }

  if (sql === `SELECT ${ORDER_HEADER_SELECT} FROM orders WHERE order_number = $1 AND guest_session_id = $2`) {
    const row = findOrderByNumberAndSession(state, params[0], params[1]);
    return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
  }

  if (sql === 'SELECT id FROM orders WHERE order_number = $1 AND guest_session_id = $2') {
    const row = findOrderByNumberAndSession(state, params[0], params[1]);
    return { rows: row ? [{ id: row.id }] : [], rowCount: row ? 1 : 0 };
  }

  if (
    sql
    === 'SELECT id, menu_item_id, menu_item_name, quantity, unit_price, line_total FROM order_items WHERE order_id = $1 ORDER BY menu_item_name ASC'
  ) {
    const rows = [...state.order_items.values()]
      .filter((item) => item.order_id === params[0])
      .sort((a, b) => a.menu_item_name.localeCompare(b.menu_item_name));
    return { rows, rowCount: rows.length };
  }

  if (
    sql
    === 'SELECT option_group_id, option_group_name, menu_item_option_id, option_name FROM order_item_options WHERE order_item_id = $1 ORDER BY option_group_id ASC'
  ) {
    const rows = state.order_item_options
      .filter((option) => option.order_item_id === params[0])
      .sort((a, b) => a.option_group_id.localeCompare(b.option_group_id));
    return { rows, rowCount: rows.length };
  }

  if (
    sql.startsWith(
      'SELECT oio.order_item_id, oio.option_group_id, oio.option_group_name, oio.menu_item_option_id, oio.option_name FROM order_item_options oio INNER JOIN order_items oi ON oio.order_item_id = oi.id WHERE oi.order_id = $1'
    )
  ) {
    const orderId = params[0];
    const itemRows = [...state.order_items.values()]
      .filter((item) => item.order_id === orderId)
      .sort((a, b) => a.menu_item_name.localeCompare(b.menu_item_name));
    const rows = [];
    for (const item of itemRows) {
      const options = state.order_item_options
        .filter((option) => option.order_item_id === item.id)
        .sort((a, b) => a.option_group_id.localeCompare(b.option_group_id));
      for (const option of options) {
        rows.push({
          order_item_id: item.id,
          option_group_id: option.option_group_id,
          option_group_name: option.option_group_name,
          menu_item_option_id: option.menu_item_option_id,
          option_name: option.option_name,
        });
      }
    }
    return { rows, rowCount: rows.length };
  }

  if (
    sql
    === 'SELECT order_id FROM payment_idempotency_keys WHERE guest_session_id = $1 AND idempotency_key = $2 AND expires_at > SYSUTCDATETIME()'
  ) {
    const mapKey = `${params[0]}::${params[1]}`;
    const row = state.payment_idempotency_keys.get(mapKey);
    if (!row || Date.parse(row.expires_at) <= Date.now()) {
      return { rows: [], rowCount: 0 };
    }
    return { rows: [{ order_id: row.order_id }], rowCount: 1 };
  }

  if (
    sql
    === 'INSERT INTO payment_idempotency_keys (guest_session_id, idempotency_key, order_id, result_payment_status, created_at, expires_at) VALUES ($1, $2, $3, $4, SYSUTCDATETIME(), $5)'
  ) {
    const mapKey = `${params[0]}::${params[1]}`;
    const existing = state.payment_idempotency_keys.get(mapKey);
    if (existing) {
      if (existing.order_id !== params[2]) {
        const error = new Error('Duplicate idempotency key for different order');
        error.code = 'DUPLICATE_IDEMPOTENCY_KEY';
        throw error;
      }
      return { rows: [], rowCount: 0 };
    }
    state.payment_idempotency_keys.set(mapKey, {
      guest_session_id: params[0],
      idempotency_key: params[1],
      order_id: params[2],
      result_payment_status: params[3],
      created_at: nowIso(),
      expires_at: params[4],
    });
    return { rows: [], rowCount: 1 };
  }

  if (
    sql
    === 'DELETE FROM payment_idempotency_keys WHERE guest_session_id = $1 AND idempotency_key = $2 AND expires_at <= SYSUTCDATETIME()'
  ) {
    const mapKey = `${params[0]}::${params[1]}`;
    const row = state.payment_idempotency_keys.get(mapKey);
    if (row && Date.parse(row.expires_at) <= Date.now()) {
      state.payment_idempotency_keys.delete(mapKey);
      return { rows: [], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (
    sql
    === 'UPDATE payment_idempotency_keys SET expires_at = $3 WHERE guest_session_id = $1 AND idempotency_key = $2'
  ) {
    const mapKey = `${params[0]}::${params[1]}`;
    const row = state.payment_idempotency_keys.get(mapKey);
    if (!row) {
      return { rows: [], rowCount: 0 };
    }
    row.expires_at = params[2];
    return { rows: [], rowCount: 1 };
  }

  if (sql.startsWith("UPDATE orders SET payment_status = 'pending'")) {
    const row = findOrderByNumberAndSession(state, params[0], params[1]);
    if (!row || row.status === 'cancelled') {
      return { rows: [], rowCount: 0 };
    }
    const ps = row.payment_status ?? 'unpaid';
    if (!['unpaid', 'failed', 'pending'].includes(ps)) {
      return { rows: [], rowCount: 0 };
    }
    const ts = nowIso();
    row.payment_status = 'pending';
    row.payment_status_updated_at = ts;
    return { rows: [], rowCount: 1 };
  }

  if (sql.startsWith("UPDATE orders SET payment_status = 'failed'")) {
    const row = findOrderByNumberAndSession(state, params[0], params[1]);
    if (!row) {
      return { rows: [], rowCount: 0 };
    }
    const ts = nowIso();
    row.payment_status = 'failed';
    row.payment_status_updated_at = ts;
    row.payment_failed_at = ts;
    row.payment_failure_reason = params[2];
    return { rows: [], rowCount: 1 };
  }

  if (sql.startsWith("UPDATE orders SET payment_status = 'paid'")) {
    const row = findOrderByNumberAndSession(state, params[0], params[1]);
    if (!row) {
      return { rows: [], rowCount: 0 };
    }
    const ts = nowIso();
    row.payment_status = 'paid';
    row.payment_status_updated_at = ts;
    row.paid_at = ts;
    row.payment_failure_reason = null;
    return { rows: [], rowCount: 1 };
  }

  if (sql.startsWith("UPDATE orders SET status = 'cancelled'")) {
    const row = findOrderByNumberAndSession(state, params[0], params[1]);
    if (!row || row.status !== 'created') {
      return { rows: [], rowCount: 0 };
    }
    const ts = nowIso();
    const ps = row.payment_status ?? 'unpaid';
    row.status = 'cancelled';
    row.cancelled_at = ts;
    row.status_updated_at = ts;
    row.payment_status_updated_at = ts;
    if (ps === 'paid') {
      row.payment_status = 'refunded';
      row.refunded_at = ts;
    } else if (ps === 'pending') {
      row.payment_status = 'failed';
      row.payment_failed_at = ts;
      row.payment_failure_reason = params[2] ?? '付款逾時已中止';
    }
    return { rows: [], rowCount: 1 };
  }

  if (sql === 'DELETE FROM order_idempotency_keys WHERE expires_at <= $1') {
    const cutoff = Date.parse(params[0]);
    let removed = 0;
    for (const [key, row] of [...state.order_idempotency_keys.entries()]) {
      if (Date.parse(row.expires_at) <= cutoff) {
        state.order_idempotency_keys.delete(key);
        removed += 1;
      }
    }
    return { rows: [], rowCount: removed };
  }

  const menuResult = tryExecuteMenuQuery(state, sql, params);
  if (menuResult !== undefined) {
    return menuResult;
  }

  throw new Error(`memoryDatabase: unsupported query: ${sql.slice(0, 120)}`);
}

export function resetMemoryDatabase() {
  sharedState = createEmptyState();
}

export function createMemoryPool() {
  const pool = {
    __memory: true,
    async query(text, params) {
      return executeQuery(sharedState, text, params);
    },
    async connect() {
      let txState = null;
      let snapshot = null;
      return {
        query: async (text, params) => {
          const sql = normalizeSql(text);
          if (sql === 'BEGIN') {
            snapshot = cloneState(sharedState);
            txState = cloneState(sharedState);
            return { rows: [], rowCount: 0 };
          }
          if (sql === 'COMMIT') {
            if (txState) {
              sharedState = txState;
            }
            txState = null;
            snapshot = null;
            return { rows: [], rowCount: 0 };
          }
          if (sql === 'ROLLBACK') {
            if (snapshot) {
              sharedState = snapshot;
            }
            txState = null;
            snapshot = null;
            return { rows: [], rowCount: 0 };
          }

          const active = txState ?? sharedState;
          return executeQuery(active, text, params);
        },
        release() {},
      };
    },
    initSchema() {
      resetMemoryDatabase();
      seedMenuCatalogIntoMemoryState(sharedState);
      return Promise.resolve();
    },
  };

  return pool;
}

export function memoryRandomUuid() {
  return crypto.randomUUID();
}
