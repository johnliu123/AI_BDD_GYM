import { categories, menuItems } from '../data/menuData.js';

export function listCategories() {
  return categories.map((category) => ({ ...category }));
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
      price: Number(item.price),
      category_id: item.category_id,
      category_name: category ? category.name : '未分類',
      is_active: item.is_active,
    };
  });
}
