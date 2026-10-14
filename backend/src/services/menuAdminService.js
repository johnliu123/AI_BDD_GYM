import {
  createCategoryRecord,
  createMenuItemRecord,
  deleteCategoryRecord,
  listCategories,
  patchMenuItemAvailability,
  patchMenuOptionAvailability,
  updateCategoryRecord,
  updateMenuItemRecord,
} from '../repositories/menuRepository.js';
import { createHttpError } from '../utils/httpError.js';

function validateCategoryName(name) {
  if (typeof name !== 'string' || !name.trim()) {
    throw createHttpError('INVALID_REQUEST_BODY', 400);
  }
  return name.trim();
}

function validatePrice(price) {
  if (typeof price !== 'string' || !/^\d+(\.\d{1,2})?$/.test(price)) {
    throw createHttpError('INVALID_REQUEST_BODY', 400);
  }
  return price;
}

export function listMerchantCategories() {
  return { categories: listCategories() };
}

export async function createMerchantCategory(body) {
  const name = validateCategoryName(body?.name);
  const sort_order = body?.sort_order !== undefined ? Number(body.sort_order) : null;
  if (sort_order !== null && !Number.isInteger(sort_order)) {
    throw createHttpError('INVALID_REQUEST_BODY', 400);
  }
  const category = await createCategoryRecord({ name, sort_order });
  return { category };
}

export async function updateMerchantCategory(categoryId, body) {
  if (!body || (body.name === undefined && body.sort_order === undefined)) {
    throw createHttpError('INVALID_REQUEST_BODY', 400);
  }
  const patch = {};
  if (body.name !== undefined) {
    patch.name = validateCategoryName(body.name);
  }
  if (body.sort_order !== undefined) {
    const sort_order = Number(body.sort_order);
    if (!Number.isInteger(sort_order)) {
      throw createHttpError('INVALID_REQUEST_BODY', 400);
    }
    patch.sort_order = sort_order;
  }
  const category = await updateCategoryRecord(categoryId, patch);
  return { category };
}

export async function removeMerchantCategory(categoryId) {
  await deleteCategoryRecord(categoryId);
}

function normalizeOptionGroupsInput(optionGroups) {
  if (!Array.isArray(optionGroups)) {
    return [];
  }
  return optionGroups.map((group) => ({
    id: group.id,
    name: group.name,
    is_required: group.is_required !== false,
    options: (group.options || []).map((option) => ({
      id: option.id,
      name: option.name,
      price_adjustment: validatePrice(String(option.price_adjustment ?? '0.00')),
      is_active: option.is_active !== false,
    })),
  }));
}

export async function createMerchantMenuItem(body) {
  if (!body?.name || !body?.category_id || body?.price === undefined) {
    throw createHttpError('INVALID_REQUEST_BODY', 400);
  }
  const item = await createMenuItemRecord({
    name: String(body.name).trim(),
    category_id: body.category_id,
    price: validatePrice(String(body.price)),
    image_url: body.image_url ?? null,
    is_active: body.is_active !== false,
    option_groups: normalizeOptionGroupsInput(body.option_groups),
  });
  return { item };
}

export async function updateMerchantMenuItem(menuItemId, body) {
  if (!body || Object.keys(body).length === 0) {
    throw createHttpError('INVALID_REQUEST_BODY', 400);
  }
  const patch = {};
  if (body.name !== undefined) {
    patch.name = String(body.name).trim();
  }
  if (body.category_id !== undefined) {
    patch.category_id = body.category_id;
  }
  if (body.price !== undefined) {
    patch.price = validatePrice(String(body.price));
  }
  if (body.image_url !== undefined) {
    patch.image_url = body.image_url;
  }
  if (body.is_active !== undefined) {
    patch.is_active = Boolean(body.is_active);
  }
  if (body.option_groups !== undefined) {
    patch.option_groups = normalizeOptionGroupsInput(body.option_groups);
  }
  const item = await updateMenuItemRecord(menuItemId, patch);
  return { item };
}

export async function setMenuItemAvailability(menuItemId, isActive) {
  if (typeof isActive !== 'boolean') {
    throw createHttpError('INVALID_REQUEST_BODY', 400);
  }
  const item = await patchMenuItemAvailability(menuItemId, isActive);
  return { item };
}

export async function setMenuOptionAvailability(menuItemId, optionId, isActive) {
  if (typeof isActive !== 'boolean') {
    throw createHttpError('INVALID_REQUEST_BODY', 400);
  }
  const item = await patchMenuOptionAvailability(menuItemId, optionId, isActive);
  return { item };
}
