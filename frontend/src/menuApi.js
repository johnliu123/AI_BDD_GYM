export async function loadMenuData(fetcher = fetch, { signal } = {}) {
  const [categoryResponse, itemResponse] = await Promise.all([
    fetcher('/api/categories', { signal }),
    fetcher('/api/menu-items', { signal }),
  ]);

  if (!categoryResponse.ok || !itemResponse.ok) {
    throw new Error('MENU_DATA_REQUEST_FAILED');
  }

  const [categoriesData, itemsData] = await Promise.all([
    categoryResponse.json(),
    itemResponse.json(),
  ]);

  if (!Array.isArray(categoriesData.categories) || !Array.isArray(itemsData.items)) {
    throw new Error('INVALID_MENU_DATA_RESPONSE');
  }

  return {
    categories: categoriesData.categories,
    items: itemsData.items,
  };
}