import { categories, menuItems } from '../data/menuData.js';

export function listCategories() {
  return categories.map((category) => ({ ...category }));
}

export function normalizeOptionGroups(item) {
  const groups = Array.isArray(item.option_groups) ? item.option_groups : [];

  return groups
    .map((group) => ({
      id: group.id,
      name: group.name,
      is_required: Boolean(group.is_required),
      options: (group.options || []).map((option) => ({
          id: option.id,
          name: option.name,
          price_adjustment: typeof option.price_adjustment === 'string' ? option.price_adjustment : String(option.price_adjustment ?? '0.00'),
          is_active: Boolean(option.is_active),
        })),
    }))
    .filter((group) => group.options.length > 0 || group.is_required === false);
}

export function listMenuItems(categoryId) {
  const normalizedCategoryId = categoryId ?? null;
  const filteredItems = normalizedCategoryId
    ? menuItems.filter((item) => item.category_id === normalizedCategoryId)
    : [...menuItems];

  return filteredItems.map((item) => {
    const category = categories.find((entry) => entry.id === item.category_id);

    return {
      id: item.id,
      name: item.name,
      image_url: item.image_url ?? null,
      price: typeof item.price === 'string' ? item.price : String(item.price ?? '0.00'),
      category_id: item.category_id,
      category_name: category ? category.name : '未分類',
      is_active: item.is_active,
      option_groups: normalizeOptionGroups(item),
    };
  });
}

export function getMenuItemById(itemId) {
  return menuItems.find((item) => item.id === itemId) ?? null;
}
