import { listCategories, listMenuItems } from '../repositories/menuRepository.js';

export function getCategories() {
  return listCategories();
}

export function getMenuItems(categoryId) {
  return listMenuItems(categoryId);
}
