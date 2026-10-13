import { getMenuItemById } from '../repositories/menuRepository.js';
import { formatMoney, moneyToCents, sumMoneyStrings } from './money.js';

function getOptionGroups(item) {
  return Array.isArray(item?.option_groups) ? item.option_groups : [];
}

function findOption(menuItem, optionId) {
  for (const group of getOptionGroups(menuItem)) {
    const option = (group.options || []).find((entry) => entry.id === optionId);
    if (option) {
      return { group, option };
    }
  }
  return null;
}

function hasValidOptionSelection(menuItem, selectedIds) {
  const groups = getOptionGroups(menuItem);
  if (!Array.isArray(selectedIds) || new Set(selectedIds).size !== selectedIds.length) {
    return false;
  }

  if (groups.length === 0) {
    return selectedIds.length === 0;
  }

  const matchedIds = new Set();
  for (const group of groups) {
    const activeOptions = (group.options || []).filter((option) => option && option.is_active);
    const selectedInGroup = selectedIds.filter((selectedId) => activeOptions.some((option) => option.id === selectedId));
    if (selectedInGroup.length !== 1) {
      return false;
    }
    matchedIds.add(selectedInGroup[0]);
  }

  return matchedIds.size === selectedIds.length;
}

function isItemAvailable(menuItem, selectedIds) {
  if (!menuItem || !menuItem.is_active) {
    return false;
  }

  for (const optionId of selectedIds) {
    const match = findOption(menuItem, optionId);
    if (!match || !match.option.is_active) {
      return false;
    }
  }

  return hasValidOptionSelection(menuItem, selectedIds);
}

export function buildCartState(cartRows) {
  const items = cartRows.map((entry) => {
    const menuItem = getMenuItemById(entry.menu_item_id);
    const selectedIds = entry.menu_item_option_ids || [];
    const available = isItemAvailable(menuItem, selectedIds);

    const options = [];
    for (const optionId of selectedIds) {
      const match = findOption(menuItem, optionId);
      if (match) {
        options.push({
          option_group_id: match.group.id,
          option_group_name: match.group.name,
          option_id: match.option.id,
          option_name: match.option.name,
          price_adjustment: typeof match.option.price_adjustment === 'string'
            ? match.option.price_adjustment
            : formatMoney(match.option.price_adjustment || '0.00'),
        });
      }
    }

    if (!available) {
      return {
        id: entry.id,
        menu_item_id: entry.menu_item_id,
        menu_item_name: menuItem?.name ?? '已下架餐點',
        quantity: entry.quantity,
        availability: 'unavailable',
        options,
      };
    }

    let adjustment = 0n;
    for (const optionId of selectedIds) {
      const match = findOption(menuItem, optionId);
      if (match) {
        adjustment += moneyToCents(match.option.price_adjustment || '0.00');
      }
    }

    const unitCents = moneyToCents(menuItem.price || '0.00') + adjustment;
    const unitPrice = formatMoney(unitCents);
    const lineTotal = formatMoney(unitCents * BigInt(entry.quantity || 0));

    return {
      id: entry.id,
      menu_item_id: entry.menu_item_id,
      menu_item_name: menuItem.name,
      quantity: entry.quantity,
      availability: 'available',
      options,
      unit_price: unitPrice,
      line_total: lineTotal,
    };
  });

  const total = sumMoneyStrings(
    items.filter((item) => item.availability === 'available').map((item) => item.line_total || '0.00')
  );

  return { items, total };
}

export { hasValidOptionSelection, isItemAvailable, getOptionGroups, findOption };
