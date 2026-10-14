import express from 'express';
import { attachGuestSession } from '../middleware/guestSession.js';
import { validateCsrf, validateOrigin } from '../services/cartService.js';
import { createOrderFromCart, getOrderForSession, toOrderResponse } from '../services/orderService.js';
import { cancelOrderForSession, payOrderForSession } from '../services/paymentService.js';
import { toClientErrorPayload } from '../utils/clientError.js';
import { logServerError } from '../utils/safeLogger.js';

const router = express.Router();

const IGNORED_CLIENT_AMOUNT_KEYS = new Set(['total_amount']);

function validateCreateOrderBody(body) {
  if (body === undefined || body === null) {
    return true;
  }
  if (typeof body !== 'object' || Array.isArray(body)) {
    return false;
  }
  return Object.keys(body).every((key) => IGNORED_CLIENT_AMOUNT_KEYS.has(key));
}

function validatePayOrderBody(body) {
  if (body === undefined || body === null) {
    return true;
  }
  if (typeof body !== 'object' || Array.isArray(body)) {
    return false;
  }
  const keys = Object.keys(body);
  if (keys.length === 0) {
    return true;
  }
  return keys.every(
    (key) =>
      IGNORED_CLIENT_AMOUNT_KEYS.has(key)
      || (key === 'simulate_outcome'
        && (body.simulate_outcome === 'success' || body.simulate_outcome === 'failure'))
  );
}

router.use('/api/orders', attachGuestSession);

function isOrderWritePost(req) {
  if (req.method !== 'POST') {
    return false;
  }
  const path = req.path || '';
  return path === '/api/orders' || /\/pay$/.test(path) || /\/cancel$/.test(path);
}

router.use('/api/orders', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  if (isOrderWritePost(req) && !validateOrigin(req, res)) {
    return;
  }
  if (isOrderWritePost(req) && !validateCsrf(req, res)) {
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

function readIdempotencyKey(req) {
  return (req.headers['idempotency-key'] || req.headers['Idempotency-Key'] || '').toString().trim();
}

function validateIdempotencyKeyHeader(key, res) {
  if (!key) {
    return true;
  }
  if (key.length < 1 || key.length > 128) {
    res.status(400).json({
      error: {
        code: 'INVALID_IDEMPOTENCY_KEY',
        message: 'Idempotency-Key 長度無效。',
      },
    });
    return false;
  }
  return true;
}

router.post('/api/orders/:order_number/pay', async (req, res) => {
  try {
    const idempotencyKey = readIdempotencyKey(req);
    if (!validateIdempotencyKeyHeader(idempotencyKey, res)) {
      return;
    }

    if (!validatePayOrderBody(req.body)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST_BODY',
          message: '請求 body 含有不允許的欄位。',
        },
      });
    }

    const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
    const simulateOutcome = body.simulate_outcome;

    const result = await payOrderForSession(req.sessionID, req.params.order_number, {
      idempotencyKey: idempotencyKey || null,
      simulateOutcome,
    });
    res.status(200).json(toOrderResponse(result.order));
  } catch (error) {
    const { status, body } = toClientErrorPayload(error, '付款失敗。');
    if (status >= 500) {
      logServerError('orders.pay', error, { path: req.path, method: req.method });
    }
    res.status(status).json(body);
  }
});

router.post('/api/orders/:order_number/cancel', async (req, res) => {
  try {
    const order = await cancelOrderForSession(req.sessionID, req.params.order_number);
    res.status(200).json(toOrderResponse(order));
  } catch (error) {
    const { status, body } = toClientErrorPayload(error, '取消訂單失敗。');
    if (status >= 500) {
      logServerError('orders.cancel', error, { path: req.path, method: req.method });
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
