import express from 'express';
import { attachGuestSession } from '../middleware/guestSession.js';
import { toClientErrorPayload } from '../utils/clientError.js';
import {
  addCartItem,
  deleteCartItem,
  readCart,
  refreshCsrf,
  updateCartItem,
  validateCsrf,
  validateOrigin,
} from '../services/cartService.js';
import { logServerError } from '../utils/safeLogger.js';

const router = express.Router();

router.use('/api/cart', attachGuestSession);

router.use('/api/cart', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET' && !validateOrigin(req, res)) {
    return;
  }
  if (req.method !== 'GET' && !validateCsrf(req, res)) {
    return;
  }
  next();
});

router.get('/api/cart', async (req, res, next) => {
  try {
    const cartState = await readCart(req.sessionID);
    res.json({
      cart: { items: cartState.items, total: cartState.total },
      csrf_token: refreshCsrf(req.session),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/api/cart/items', async (req, res, next) => {
  try {
    const cartState = await addCartItem(req.sessionID, req.body || {});
    res.status(201).json({
      cart: { items: cartState.items, total: cartState.total },
      csrf_token: req.session.csrf_token,
    });
  } catch (error) {
    const { status, body } = toClientErrorPayload(error, '購物車處理失敗。');
    if (status >= 500) {
      logServerError('cart.addItem', error, { path: req.path, method: req.method });
    }
    res.status(status).json(body);
  }
});

router.patch('/api/cart/items/:itemId', async (req, res, next) => {
  try {
    const nextQuantity = Number(req.body?.quantity);
    const cartState = await updateCartItem(req.sessionID, req.params.itemId, nextQuantity);
    res.json({
      cart: { items: cartState.items, total: cartState.total },
      csrf_token: req.session.csrf_token,
    });
  } catch (error) {
    const { status, body } = toClientErrorPayload(error, '購物車更新失敗。');
    if (status >= 500) {
      logServerError('cart.updateItem', error, { path: req.path, method: req.method });
    }
    res.status(status).json(body);
  }
});

router.delete('/api/cart/items/:itemId', async (req, res, next) => {
  try {
    const cartState = await deleteCartItem(req.sessionID, req.params.itemId);
    res.json({
      cart: { items: cartState.items, total: cartState.total },
      csrf_token: req.session.csrf_token,
    });
  } catch (error) {
    const { status, body } = toClientErrorPayload(error, '購物車刪除失敗。');
    if (status >= 500) {
      logServerError('cart.deleteItem', error, { path: req.path, method: req.method });
    }
    res.status(status).json(body);
  }
});

export default router;
