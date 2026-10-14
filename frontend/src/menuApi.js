function assertMenuItemsPayload(body) {
  if (!Array.isArray(body?.items)) {
    throw new Error('INVALID_MENU_DATA_RESPONSE');
  }
  return body;
}

export async function loadPublicMenuItems(fetcher = fetch, { signal } = {}) {
  const response = await fetcher('/api/menu-items', { signal });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error?.message || '載入餐點失敗。');
  }
  return assertMenuItemsPayload(body);
}

export async function loadMenuData(fetcher = fetch, { signal } = {}) {
  let categoriesData;
  let itemsData;
  try {
    [categoriesData, itemsData] = await Promise.all([
      fetcher('/api/categories', { signal }).then(async (categoryResponse) => {
        if (!categoryResponse.ok) {
          throw new Error('MENU_DATA_REQUEST_FAILED');
        }
        const data = await categoryResponse.json();
        if (!Array.isArray(data.categories)) {
          throw new Error('INVALID_MENU_DATA_RESPONSE');
        }
        return data;
      }),
      loadPublicMenuItems(fetcher, { signal }),
    ]);
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw error;
    }
    if (error.message === 'INVALID_MENU_DATA_RESPONSE') {
      throw error;
    }
    throw new Error('MENU_DATA_REQUEST_FAILED');
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