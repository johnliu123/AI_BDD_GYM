import express from 'express';
import { requireMerchantRole } from '../middleware/merchantAuth.js';
import {
  createMerchantCategory,
  createMerchantMenuItem,
  listMerchantCategories,
  removeMerchantCategory,
  setMenuItemAvailability,
  setMenuOptionAvailability,
  updateMerchantCategory,
  updateMerchantMenuItem,
} from '../services/menuAdminService.js';
import { toClientErrorPayload } from '../utils/clientError.js';
import { logServerError } from '../utils/safeLogger.js';

const router = express.Router();
const menuGuard = requireMerchantRole('menu', 'admin');

function handleError(res, error, context) {
  const { status, body } = toClientErrorPayload(error, '請求無法完成。');
  if (status >= 500) {
    logServerError(context, error);
  }
  res.status(status).json(body);
}

router.get('/api/merchant/categories', menuGuard, (req, res) => {
  try {
    res.json(listMerchantCategories());
  } catch (error) {
    handleError(res, error, 'merchantMenu.listCategories');
  }
});

router.post('/api/merchant/categories', menuGuard, async (req, res) => {
  try {
    const payload = await createMerchantCategory(req.body);
    res.status(201).json(payload);
  } catch (error) {
    handleError(res, error, 'merchantMenu.createCategory');
  }
});

router.patch('/api/merchant/categories/:category_id', menuGuard, async (req, res) => {
  try {
    const payload = await updateMerchantCategory(req.params.category_id, req.body);
    res.json(payload);
  } catch (error) {
    handleError(res, error, 'merchantMenu.updateCategory');
  }
});

router.delete('/api/merchant/categories/:category_id', menuGuard, async (req, res) => {
  try {
    await removeMerchantCategory(req.params.category_id);
    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'merchantMenu.deleteCategory');
  }
});

router.post('/api/merchant/menu-items', menuGuard, async (req, res) => {
  try {
    const payload = await createMerchantMenuItem(req.body);
    res.status(201).json(payload);
  } catch (error) {
    handleError(res, error, 'merchantMenu.createItem');
  }
});

router.patch('/api/merchant/menu-items/:menu_item_id', menuGuard, async (req, res) => {
  try {
    const payload = await updateMerchantMenuItem(req.params.menu_item_id, req.body);
    res.json(payload);
  } catch (error) {
    handleError(res, error, 'merchantMenu.updateItem');
  }
});

router.patch('/api/merchant/menu-items/:menu_item_id/availability', menuGuard, async (req, res) => {
  try {
    const payload = await setMenuItemAvailability(req.params.menu_item_id, req.body?.is_active);
    res.json(payload);
  } catch (error) {
    handleError(res, error, 'merchantMenu.patchItemAvailability');
  }
});

router.patch(
  '/api/merchant/menu-items/:menu_item_id/options/:option_id/availability',
  menuGuard,
  async (req, res) => {
    try {
      const payload = await setMenuOptionAvailability(
        req.params.menu_item_id,
        req.params.option_id,
        req.body?.is_active
      );
      res.json(payload);
    } catch (error) {
      handleError(res, error, 'merchantMenu.patchOptionAvailability');
    }
  }
);

export default router;
