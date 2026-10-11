import express from 'express';
import { getCategories, getMenuItems } from '../services/menu-service.js';
import { listCategories } from '../repositories/menuRepository.js';

const router = express.Router();

router.get('/api/categories', (req, res) => {
  res.json({ categories: getCategories() });
});

router.get('/api/menu-items', (req, res) => {
  const { category_id } = req.query;
  const categories = listCategories();

  if (category_id && !categories.some((category) => category.id === category_id)) {
    return res.status(400).json({
      error: {
        code: 'INVALID_CATEGORY_ID',
        message: '未找到指定分類。',
      },
    });
  }

  const items = getMenuItems(category_id || undefined);
  return res.json({ items });
});

export default router;
