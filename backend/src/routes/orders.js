import express from 'express';
import { attachGuestSession } from '../middleware/guestSession.js';
import { validateCsrf, validateOrigin } from '../services/cartService.js';
import { createOrderFromCart, getOrderForSession, toOrderResponse } from '../services/orderService.js';
import { toClientErrorPayload } from '../utils/clientError.js';
import { logServerError } from '../utils/safeLogger.js';

const router = express.Router();

function validateCreateOrderBody(body) {
  if (body === undefined || body === null) {
    return true;
  }
  if (typeof body !== 'object' || Array.isArray(body)) {
    return false;
  }
  return Object.keys(body).length === 0;
}

router.use('/api/orders', attachGuestSession);

router.use('/api/orders', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'POST' && !validateOrigin(req, res)) {
    return;
  }
  if (req.method === 'POST' && !validateCsrf(req, res)) {
    return;
  }
  next();
});

router.post('/api/orders', async (req, res) => {
  try {
    if (!validateCreateOrderBody(req.body)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST_BODY',
          message: '請求 body 含有不允許的欄位。',
        },
      });
    }

    const idempotencyKey = (req.headers['idempotency-key'] || req.headers['Idempotency-Key'] || '')
      .toString()
      .trim();
    if (idempotencyKey && (idempotencyKey.length < 1 || idempotencyKey.length > 128)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_IDEMPOTENCY_KEY',
          message: 'Idempotency-Key 長度無效。',
        },
      });
    }

    const result = await createOrderFromCart(
      req.sessionID,
      idempotencyKey || null
    );
    res.status(result.replay ? 200 : 201).json(toOrderResponse(result.order));
  } catch (error) {
    const { status, body } = toClientErrorPayload(error, '訂單建立失敗。');
    if (status >= 500) {
      logServerError('orders.create', error, { path: req.path, method: req.method });
    }
    res.status(status).json(body);
  }
});

router.get('/api/orders/:order_number', async (req, res) => {
  try {
    const order = await getOrderForSession(req.sessionID, req.params.order_number);
    res.json(toOrderResponse(order));
  } catch (error) {
    const { status, body } = toClientErrorPayload(error, '訂單查詢失敗。');
    if (status >= 500) {
      logServerError('orders.get', error, { path: req.path, method: req.method });
    }
    res.status(status).json(body);
  }
});

export default router;
