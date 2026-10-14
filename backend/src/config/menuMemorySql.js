function bitToBool(value) {
  if (typeof value === 'boolean') {
    return value;
  }
  return value === 1 || value === true;
}

function boolToBit(value) {
  return value ? 1 : 0;
}

function formatPrice(value) {
  if (typeof value === 'string') {
    return value;
  }
  return Number(value).toFixed(2);
}

export function tryExecuteMenuQuery(state, sql, params = []) {
  if (sql === 'SELECT id, name, sort_order FROM categories ORDER BY sort_order ASC, name ASC') {
    const rows = [...state.categories.values()].sort((a, b) => {
      const sortA = a.sort_order ?? 9999;
      const sortB = b.sort_order ?? 9999;
      if (sortA !== sortB) {
        return sortA - sortB;
      }
      return a.name.localeCompare(b.name);
    });
    return { rows: rows.map((row) => ({ id: row.id, name: row.name, sort_order: row.sort_order })), rowCount: rows.length };
  }

  if (sql === 'SELECT id, name, sort_order FROM categories WHERE id = $1') {
    const row = state.categories.get(params[0]);
    return { rows: row ? [{ id: row.id, name: row.name, sort_order: row.sort_order }] : [], rowCount: row ? 1 : 0 };
  }

  if (sql === 'SELECT id FROM categories WHERE name = $1') {
    const row = [...state.categories.values()].find((entry) => entry.name === params[0]);
    return { rows: row ? [{ id: row.id }] : [], rowCount: row ? 1 : 0 };
  }

  if (sql === 'SELECT id FROM categories WHERE name = $1 AND id <> $2') {
    const row = [...state.categories.values()].find((entry) => entry.name === params[0] && entry.id !== params[1]);
    return { rows: row ? [{ id: row.id }] : [], rowCount: row ? 1 : 0 };
  }

  if (sql === 'SELECT COUNT(*) AS count FROM menu_items WHERE category_id = $1') {
    const count = [...state.menu_items.values()].filter((item) => item.category_id === params[0]).length;
    return { rows: [{ count }], rowCount: 1 };
  }

  if (
    sql
    === 'SELECT mi.id, mi.category_id, mi.name, mi.image_url, mi.price, mi.is_active, c.name AS category_name FROM menu_items mi INNER JOIN categories c ON mi.category_id = c.id ORDER BY mi.name ASC'
  ) {
    const rows = [...state.menu_items.values()]
      .map((item) => {
        const category = state.categories.get(item.category_id);
        return {
          id: item.id,
          category_id: item.category_id,
          name: item.name,
          image_url: item.image_url,
          price: formatPrice(item.price),
          is_active: bitToBool(item.is_active),
          category_name: category?.name ?? '未分類',
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    return { rows, rowCount: rows.length };
  }

  if (
    sql
    === 'SELECT mi.id, mi.category_id, mi.name, mi.image_url, mi.price, mi.is_active, c.name AS category_name FROM menu_items mi INNER JOIN categories c ON mi.category_id = c.id WHERE mi.category_id = $1 ORDER BY mi.name ASC'
  ) {
    const rows = [...state.menu_items.values()]
      .filter((item) => item.category_id === params[0])
      .map((item) => {
        const category = state.categories.get(item.category_id);
        return {
          id: item.id,
          category_id: item.category_id,
          name: item.name,
          image_url: item.image_url,
          price: formatPrice(item.price),
          is_active: bitToBool(item.is_active),
          category_name: category?.name ?? '未分類',
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    return { rows, rowCount: rows.length };
  }

  if (
    sql
    === 'SELECT mi.id, mi.category_id, mi.name, mi.image_url, mi.price, mi.is_active, c.name AS category_name FROM menu_items mi INNER JOIN categories c ON mi.category_id = c.id WHERE mi.id = $1'
  ) {
    const item = state.menu_items.get(params[0]);
    if (!item) {
      return { rows: [], rowCount: 0 };
    }
    const category = state.categories.get(item.category_id);
    return {
      rows: [
        {
          id: item.id,
          category_id: item.category_id,
          name: item.name,
          image_url: item.image_url,
          price: formatPrice(item.price),
          is_active: bitToBool(item.is_active),
          category_name: category?.name ?? '未分類',
        },
      ],
      rowCount: 1,
    };
  }

  if (
    sql
    === 'SELECT id, menu_item_id, name, is_required, sort_order FROM menu_item_option_groups WHERE menu_item_id = $1 ORDER BY sort_order ASC'
  ) {
    const rows = [...state.menu_item_option_groups.values()]
      .filter((group) => group.menu_item_id === params[0])
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    return {
      rows: rows.map((row) => ({
        id: row.id,
        menu_item_id: row.menu_item_id,
        name: row.name,
        is_required: bitToBool(row.is_required),
        sort_order: row.sort_order,
      })),
      rowCount: rows.length,
    };
  }

  if (
    sql
    === 'SELECT id, menu_item_id, option_group_id, name, price_adjustment, is_active FROM menu_item_options WHERE menu_item_id = $1'
  ) {
    const rows = [...state.menu_item_options.values()].filter((option) => option.menu_item_id === params[0]);
    return {
      rows: rows.map((row) => ({
        id: row.id,
        menu_item_id: row.menu_item_id,
        option_group_id: row.option_group_id,
        name: row.name,
        price_adjustment: formatPrice(row.price_adjustment),
        is_active: bitToBool(row.is_active),
      })),
      rowCount: rows.length,
    };
  }

  if (
    sql
    === 'SELECT id, menu_item_id, name, is_required, sort_order FROM menu_item_option_groups ORDER BY sort_order ASC'
  ) {
    const rows = [...state.menu_item_option_groups.values()]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    return {
      rows: rows.map((row) => ({
        id: row.id,
        menu_item_id: row.menu_item_id,
        name: row.name,
        is_required: bitToBool(row.is_required),
        sort_order: row.sort_order,
      })),
      rowCount: rows.length,
    };
  }

  if (
    sql
    === 'SELECT id, menu_item_id, option_group_id, name, price_adjustment, is_active FROM menu_item_options'
  ) {
    const rows = [...state.menu_item_options.values()];
    return {
      rows: rows.map((row) => ({
        id: row.id,
        menu_item_id: row.menu_item_id,
        option_group_id: row.option_group_id,
        name: row.name,
        price_adjustment: formatPrice(row.price_adjustment),
        is_active: bitToBool(row.is_active),
      })),
      rowCount: rows.length,
    };
  }

  if (sql === 'INSERT INTO categories (id, name, sort_order, created_at) VALUES ($1, $2, $3, SYSUTCDATETIME())') {
    const ts = new Date().toISOString();
    state.categories.set(params[0], {
      id: params[0],
      name: params[1],
      sort_order: params[2] ?? null,
      created_at: ts,
    });
    return { rows: [], rowCount: 1 };
  }

  if (sql === 'UPDATE categories SET name = $2, sort_order = $3 WHERE id = $1') {
    const row = state.categories.get(params[0]);
    if (!row) {
      return { rows: [], rowCount: 0 };
    }
    row.name = params[1];
    row.sort_order = params[2] ?? null;
    return { rows: [], rowCount: 1 };
  }

  if (sql === 'DELETE FROM categories WHERE id = $1') {
    const existed = state.categories.delete(params[0]);
    return { rows: [], rowCount: existed ? 1 : 0 };
  }

  if (
    sql
    === 'INSERT INTO menu_items (id, category_id, name, image_url, price, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, SYSUTCDATETIME(), SYSUTCDATETIME())'
  ) {
    const ts = new Date().toISOString();
    state.menu_items.set(params[0], {
      id: params[0],
      category_id: params[1],
      name: params[2],
      image_url: params[3],
      price: formatPrice(params[4]),
      is_active: boolToBit(params[5]),
      created_at: ts,
      updated_at: ts,
    });
    return { rows: [], rowCount: 1 };
  }

  if (
    sql
    === 'UPDATE menu_items SET category_id = $2, name = $3, image_url = $4, price = $5, is_active = $6, updated_at = SYSUTCDATETIME() WHERE id = $1'
  ) {
    const row = state.menu_items.get(params[0]);
    if (!row) {
      return { rows: [], rowCount: 0 };
    }
    row.category_id = params[1];
    row.name = params[2];
    row.image_url = params[3];
    row.price = formatPrice(params[4]);
    row.is_active = boolToBit(params[5]);
    row.updated_at = new Date().toISOString();
    return { rows: [], rowCount: 1 };
  }

  if (sql === 'UPDATE menu_items SET is_active = $2, updated_at = SYSUTCDATETIME() WHERE id = $1') {
    const row = state.menu_items.get(params[0]);
    if (!row) {
      return { rows: [], rowCount: 0 };
    }
    row.is_active = boolToBit(params[1]);
    row.updated_at = new Date().toISOString();
    return { rows: [], rowCount: 1 };
  }

  if (sql === 'DELETE FROM menu_item_options WHERE menu_item_id = $1') {
    let removed = 0;
    for (const [id, option] of [...state.menu_item_options.entries()]) {
      if (option.menu_item_id === params[0]) {
        state.menu_item_options.delete(id);
        removed += 1;
      }
    }
    return { rows: [], rowCount: removed };
  }

  if (sql === 'DELETE FROM menu_item_option_groups WHERE menu_item_id = $1') {
    let removed = 0;
    for (const [id, group] of [...state.menu_item_option_groups.entries()]) {
      if (group.menu_item_id === params[0]) {
        state.menu_item_option_groups.delete(id);
        removed += 1;
      }
    }
    return { rows: [], rowCount: removed };
  }

  if (
    sql
    === 'INSERT INTO menu_item_option_groups (id, menu_item_id, name, is_required, sort_order) VALUES ($1, $2, $3, $4, $5)'
  ) {
    state.menu_item_option_groups.set(params[0], {
      id: params[0],
      menu_item_id: params[1],
      name: params[2],
      is_required: boolToBit(params[3]),
      sort_order: params[4],
    });
    return { rows: [], rowCount: 1 };
  }

  if (
    sql
    === 'INSERT INTO menu_item_options (id, menu_item_id, option_group_id, name, price_adjustment, is_active) VALUES ($1, $2, $3, $4, $5, $6)'
  ) {
    state.menu_item_options.set(params[0], {
      id: params[0],
      menu_item_id: params[1],
      option_group_id: params[2],
      name: params[3],
      price_adjustment: formatPrice(params[4]),
      is_active: boolToBit(params[5]),
    });
    return { rows: [], rowCount: 1 };
  }

  if (sql === 'UPDATE menu_item_options SET is_active = $2 WHERE id = $1 AND menu_item_id = $3') {
    const row = state.menu_item_options.get(params[0]);
    if (!row || row.menu_item_id !== params[2]) {
      return { rows: [], rowCount: 0 };
    }
    row.is_active = boolToBit(params[1]);
    return { rows: [], rowCount: 1 };
  }

  if (sql === 'SELECT id FROM menu_item_options WHERE id = $1 AND menu_item_id = $2') {
    const row = state.menu_item_options.get(params[0]);
    const ok = row && row.menu_item_id === params[1];
    return { rows: ok ? [{ id: row.id }] : [], rowCount: ok ? 1 : 0 };
  }

  return undefined;
}
