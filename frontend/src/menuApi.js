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

export function isOptionSelectionComplete(optionGroups, selectedOptions) {
  if (!Array.isArray(optionGroups) || optionGroups.length === 0) {
    return true;
  }

  return optionGroups.every((group) => Boolean(selectedOptions[group.id]));
}

export function buildAddToCartPayload(menuItem, selectedOptions, quantity = 1) {
  const optionGroups = menuItem.option_groups ?? [];
  if (!isOptionSelectionComplete(optionGroups, selectedOptions)) {
    return { error: 'INCOMPLETE_OPTION_SELECTION' };
  }

  if (!menuItem.is_active) {
    return { error: 'ITEM_UNAVAILABLE' };
  }

  return {
    payload: {
      menu_item_id: menuItem.id,
      quantity,
      menu_item_option_ids: optionGroups.map((group) => selectedOptions[group.id]),
    },
  };
}