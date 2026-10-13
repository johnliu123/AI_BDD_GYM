import crypto from 'node:crypto';

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

  if (sql === 'SELECT COUNT(*) AS count FROM guest_sessions') {
    return { rows: [{ count: state.guest_sessions.size }], rowCount: 1 };
  }

  if (sql === 'SELECT COUNT(*) AS count FROM carts') {
    return { rows: [{ count: state.carts.size }], rowCount: 1 };
  }

  if (sql === 'SELECT session_id, csrf_token, created_at, last_activity_at FROM guest_sessions WHERE session_id = $1') {
    const row = state.guest_sessions.get(params[0]);
    return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
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
      return Promise.resolve();
    },
  };

  return pool;
}

export function memoryRandomUuid() {
  return crypto.randomUUID();
}
