import { categories, menuItems } from './menuData.js';

export function seedMenuCatalogIntoMemoryState(state) {
  state.categories.clear();
  state.menu_items.clear();
  state.menu_item_option_groups.clear();
  state.menu_item_options.clear();

  const createdAt = '2026-10-01T00:00:00.000Z';
  for (const category of categories) {
    state.categories.set(category.id, {
      id: category.id,
      name: category.name,
      sort_order: category.sort_order ?? null,
      created_at: createdAt,
    });
  }

  for (const item of menuItems) {
    state.menu_items.set(item.id, {
      id: item.id,
      category_id: item.category_id,
      name: item.name,
      image_url: item.image_url ?? null,
      price: typeof item.price === 'string' ? item.price : String(item.price ?? '0.00'),
      is_active: Boolean(item.is_active),
      created_at: item.created_at ?? createdAt,
      updated_at: item.created_at ?? createdAt,
    });

    let groupSort = 0;
    for (const group of item.option_groups || []) {
      groupSort += 1;
      state.menu_item_option_groups.set(group.id, {
        id: group.id,
        menu_item_id: item.id,
        name: group.name,
        is_required: Boolean(group.is_required),
        sort_order: groupSort,
      });
      for (const option of group.options || []) {
        state.menu_item_options.set(option.id, {
          id: option.id,
          menu_item_id: item.id,
          option_group_id: group.id,
          name: option.name,
          price_adjustment:
            typeof option.price_adjustment === 'string'
              ? option.price_adjustment
              : String(option.price_adjustment ?? '0.00'),
          is_active: Boolean(option.is_active),
        });
      }
    }
  }
}
