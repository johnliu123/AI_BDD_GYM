import crypto from 'node:crypto';
import { getPool } from '../config/db.js';

const SQL = {
  listCategories:
    'SELECT id, name, sort_order FROM categories ORDER BY sort_order ASC, name ASC',
  categoryById: 'SELECT id, name, sort_order FROM categories WHERE id = $1',
  categoryByName: 'SELECT id FROM categories WHERE name = $1',
  categoryByNameExcept: 'SELECT id FROM categories WHERE name = $1 AND id <> $2',
  countItemsInCategory: 'SELECT COUNT(*) AS count FROM menu_items WHERE category_id = $1',
  listItemsAll:
    'SELECT mi.id, mi.category_id, mi.name, mi.image_url, mi.price, mi.is_active, c.name AS category_name FROM menu_items mi INNER JOIN categories c ON mi.category_id = c.id ORDER BY mi.name ASC',
  listItemsByCategory:
    'SELECT mi.id, mi.category_id, mi.name, mi.image_url, mi.price, mi.is_active, c.name AS category_name FROM menu_items mi INNER JOIN categories c ON mi.category_id = c.id WHERE mi.category_id = $1 ORDER BY mi.name ASC',
  itemById:
    'SELECT mi.id, mi.category_id, mi.name, mi.image_url, mi.price, mi.is_active, c.name AS category_name FROM menu_items mi INNER JOIN categories c ON mi.category_id = c.id WHERE mi.id = $1',
  allGroups:
    'SELECT id, menu_item_id, name, is_required, sort_order FROM menu_item_option_groups ORDER BY sort_order ASC',
  allOptions:
    'SELECT id, menu_item_id, option_group_id, name, price_adjustment, is_active FROM menu_item_options',
  insertCategory:
    'INSERT INTO categories (id, name, sort_order, created_at) VALUES ($1, $2, $3, SYSUTCDATETIME())',
  updateCategory: 'UPDATE categories SET name = $2, sort_order = $3 WHERE id = $1',
  deleteCategory: 'DELETE FROM categories WHERE id = $1',
  insertItem:
    'INSERT INTO menu_items (id, category_id, name, image_url, price, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, SYSUTCDATETIME(), SYSUTCDATETIME())',
  updateItem:
    'UPDATE menu_items SET category_id = $2, name = $3, image_url = $4, price = $5, is_active = $6, updated_at = SYSUTCDATETIME() WHERE id = $1',
  patchItemActive: 'UPDATE menu_items SET is_active = $2, updated_at = SYSUTCDATETIME() WHERE id = $1',
  deleteOptionsForItem: 'DELETE FROM menu_item_options WHERE menu_item_id = $1',
  deleteGroupsForItem: 'DELETE FROM menu_item_option_groups WHERE menu_item_id = $1',
  insertGroup:
    'INSERT INTO menu_item_option_groups (id, menu_item_id, name, is_required, sort_order) VALUES ($1, $2, $3, $4, $5)',
  insertOption:
    'INSERT INTO menu_item_options (id, menu_item_id, option_group_id, name, price_adjustment, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
  patchOptionActive: 'UPDATE menu_item_options SET is_active = $2 WHERE id = $1 AND menu_item_id = $3',
  optionById: 'SELECT id FROM menu_item_options WHERE id = $1 AND menu_item_id = $2',
};

let catalog = {
  categories: [],
  itemsById: new Map(),
};

function normalizeOptionGroups(groups, options) {
  const grouped = groups.map((group) => ({
    id: group.id,
    name: group.name,
    is_required: Boolean(group.is_required),
    options: options
      .filter((option) => option.option_group_id === group.id)
      .map((option) => ({
        id: option.id,
        name: option.name,
        price_adjustment:
          typeof option.price_adjustment === 'string'
            ? option.price_adjustment
            : String(option.price_adjustment ?? '0.00'),
        is_active: Boolean(option.is_active),
      })),
  }));

  return grouped.filter((group) => group.options.length > 0 || group.is_required === false);
}

function rowToMenuItem(row, groups, options) {
  return {
    id: row.id,
    name: row.name,
    image_url: row.image_url ?? null,
    price: typeof row.price === 'string' ? row.price : String(row.price ?? '0.00'),
    category_id: row.category_id,
    category_name: row.category_name ?? '未分類',
    is_active: Boolean(row.is_active),
    option_groups: normalizeOptionGroups(groups, options),
  };
}

export async function refreshMenuCatalog(client = getPool()) {
  const [categoriesResult, itemsResult, groupsResult, optionsResult] = await Promise.all([
    client.query(SQL.listCategories),
    client.query(SQL.listItemsAll),
    client.query(SQL.allGroups),
    client.query(SQL.allOptions),
  ]);

  const groupsByItemId = new Map();
  for (const group of groupsResult.rows) {
    const list = groupsByItemId.get(group.menu_item_id) ?? [];
    list.push(group);
    groupsByItemId.set(group.menu_item_id, list);
  }

  const optionsByItemId = new Map();
  for (const option of optionsResult.rows) {
    const list = optionsByItemId.get(option.menu_item_id) ?? [];
    list.push(option);
    optionsByItemId.set(option.menu_item_id, list);
  }

  const itemsById = new Map();
  for (const row of itemsResult.rows) {
    const item = rowToMenuItem(
      row,
      groupsByItemId.get(row.id) ?? [],
      optionsByItemId.get(row.id) ?? [],
    );
    itemsById.set(item.id, item);
  }

  catalog = {
    categories: categoriesResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      sort_order: row.sort_order ?? null,
    })),
    itemsById,
  };
}

export function listCategories() {
  return catalog.categories.map((category) => ({ ...category }));
}

export function listMenuItems(categoryId) {
  const normalizedCategoryId = categoryId ?? null;
  const items = [...catalog.itemsById.values()];
  const filtered = normalizedCategoryId
    ? items.filter((item) => item.category_id === normalizedCategoryId)
    : items;

  return filtered.map((item) => ({
    ...item,
    option_groups: item.option_groups.map((group) => ({
      ...group,
      options: group.options.map((option) => ({ ...option })),
    })),
  }));
}

export function getMenuItemById(itemId) {
  const item = catalog.itemsById.get(itemId);
  if (!item) {
    return null;
  }
  return {
    ...item,
    option_groups: item.option_groups.map((group) => ({
      ...group,
      options: group.options.map((option) => ({ ...option })),
    })),
  };
}

export async function findCategoryById(categoryId, client = getPool()) {
  const result = await client.query(SQL.categoryById, [categoryId]);
  return result.rows[0] ?? null;
}

async function assertUniqueCategoryName(name, excludeId, client) {
  const result = excludeId
    ? await client.query(SQL.categoryByNameExcept, [name, excludeId])
    : await client.query(SQL.categoryByName, [name]);
  if (result.rows.length > 0) {
    const error = new Error('DUPLICATE_CATEGORY_NAME');
    error.code = 'DUPLICATE_CATEGORY_NAME';
    error.status = 409;
    throw error;
  }
}

async function replaceOptionTree(client, menuItemId, optionGroupsInput) {
  await client.query(SQL.deleteOptionsForItem, [menuItemId]);
  await client.query(SQL.deleteGroupsForItem, [menuItemId]);

  let sortOrder = 0;
  for (const group of optionGroupsInput || []) {
    sortOrder += 1;
    const groupId = group.id || crypto.randomUUID();
    await client.query(SQL.insertGroup, [
      groupId,
      menuItemId,
      group.name,
      Boolean(group.is_required),
      sortOrder,
    ]);
    for (const option of group.options || []) {
      const optionId = option.id || crypto.randomUUID();
      await client.query(SQL.insertOption, [
        optionId,
        menuItemId,
        groupId,
        option.name,
        option.price_adjustment ?? '0.00',
        option.is_active !== false,
      ]);
    }
  }
}

export async function createCategoryRecord({ name, sort_order }, client = getPool()) {
  await assertUniqueCategoryName(name, null, client);
  const id = crypto.randomUUID();
  await client.query(SQL.insertCategory, [id, name, sort_order ?? null]);
  await refreshMenuCatalog(client);
  return { id, name, sort_order: sort_order ?? null };
}

export async function updateCategoryRecord(categoryId, { name, sort_order }, client = getPool()) {
  const existing = await findCategoryById(categoryId, client);
  if (!existing) {
    const error = new Error('CATEGORY_NOT_FOUND');
    error.code = 'CATEGORY_NOT_FOUND';
    error.status = 404;
    throw error;
  }
  const nextName = name ?? existing.name;
  const nextSort = sort_order !== undefined ? sort_order : existing.sort_order;
  await assertUniqueCategoryName(nextName, categoryId, client);
  await client.query(SQL.updateCategory, [categoryId, nextName, nextSort ?? null]);
  await refreshMenuCatalog(client);
  return { id: categoryId, name: nextName, sort_order: nextSort ?? null };
}

export async function deleteCategoryRecord(categoryId, client = getPool()) {
  const existing = await findCategoryById(categoryId, client);
  if (!existing) {
    const error = new Error('CATEGORY_NOT_FOUND');
    error.code = 'CATEGORY_NOT_FOUND';
    error.status = 404;
    throw error;
  }
  const countResult = await client.query(SQL.countItemsInCategory, [categoryId]);
  const count = Number(countResult.rows[0]?.count ?? 0);
  if (count > 0) {
    const error = new Error('CATEGORY_IN_USE');
    error.code = 'CATEGORY_IN_USE';
    error.status = 409;
    throw error;
  }
  await client.query(SQL.deleteCategory, [categoryId]);
  await refreshMenuCatalog(client);
}

export async function createMenuItemRecord(payload, client = getPool()) {
  const category = await findCategoryById(payload.category_id, client);
  if (!category) {
    const error = new Error('CATEGORY_NOT_FOUND');
    error.code = 'CATEGORY_NOT_FOUND';
    error.status = 404;
    throw error;
  }

  const connection = await client.connect();
  try {
    await connection.query('BEGIN');
    const id = crypto.randomUUID();
    await connection.query(SQL.insertItem, [
      id,
      payload.category_id,
      payload.name,
      payload.image_url ?? null,
      payload.price,
      payload.is_active !== false,
    ]);
    await replaceOptionTree(connection, id, payload.option_groups || []);
    await connection.query('COMMIT');
    await refreshMenuCatalog(client);
    return getMenuItemById(id);
  } catch (error) {
    await connection.query('ROLLBACK');
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateMenuItemRecord(menuItemId, payload, client = getPool()) {
  const existingResult = await client.query(SQL.itemById, [menuItemId]);
  const existing = existingResult.rows[0];
  if (!existing) {
    const error = new Error('MENU_ITEM_NOT_FOUND');
    error.code = 'MENU_ITEM_NOT_FOUND';
    error.status = 404;
    throw error;
  }

  const categoryId = payload.category_id ?? existing.category_id;
  if (payload.category_id) {
    const category = await findCategoryById(categoryId, client);
    if (!category) {
      const error = new Error('CATEGORY_NOT_FOUND');
      error.code = 'CATEGORY_NOT_FOUND';
      error.status = 404;
      throw error;
    }
  }

  const connection = await client.connect();
  try {
    await connection.query('BEGIN');
    await connection.query(SQL.updateItem, [
      menuItemId,
      categoryId,
      payload.name ?? existing.name,
      payload.image_url !== undefined ? payload.image_url : existing.image_url,
      payload.price ?? existing.price,
      payload.is_active !== undefined ? payload.is_active : Boolean(existing.is_active),
    ]);
    if (payload.option_groups) {
      await replaceOptionTree(connection, menuItemId, payload.option_groups);
    }
    await connection.query('COMMIT');
    await refreshMenuCatalog(client);
    return getMenuItemById(menuItemId);
  } catch (error) {
    await connection.query('ROLLBACK');
    throw error;
  } finally {
    connection.release();
  }
}

export async function patchMenuItemAvailability(menuItemId, isActive, client = getPool()) {
  const existingResult = await client.query(SQL.itemById, [menuItemId]);
  if (!existingResult.rows[0]) {
    const error = new Error('MENU_ITEM_NOT_FOUND');
    error.code = 'MENU_ITEM_NOT_FOUND';
    error.status = 404;
    throw error;
  }
  await client.query(SQL.patchItemActive, [menuItemId, isActive]);
  await refreshMenuCatalog(client);
  return getMenuItemById(menuItemId);
}

export async function patchMenuOptionAvailability(menuItemId, optionId, isActive, client = getPool()) {
  const optionResult = await client.query(SQL.optionById, [optionId, menuItemId]);
  if (!optionResult.rows[0]) {
    const error = new Error('MENU_OPTION_NOT_FOUND');
    error.code = 'MENU_OPTION_NOT_FOUND';
    error.status = 404;
    throw error;
  }
  await client.query(SQL.patchOptionActive, [optionId, isActive, menuItemId]);
  await refreshMenuCatalog(client);
  return getMenuItemById(menuItemId);
}
