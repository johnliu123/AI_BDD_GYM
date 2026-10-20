import express from 'express';
import { requireMerchantRole } from '../middleware/merchantAuth.js';
import {
  acceptMerchantOrder,
  completeMerchantOrder,
  getMerchantOrder,
  listMerchantOrders,
  startPreparingMerchantOrder,
} from '../services/merchantOrderService.js';
import { toOrderResponse } from '../services/orderService.js';
import { toClientErrorPayload } from '../utils/clientError.js';
import { logServerError } from '../utils/safeLogger.js';

const router = express.Router();
const ACTION_FIELDS = new Set(['total', 'total_amount', 'unit_price', 'line_total', 'items']);
const ACTION_ITEM_FIELDS = new Set([
  'menu_item_id',
  'menu_item_name',
  'quantity',
  'unit_price',
  'line_total',
  'options',
]);

router.use('/api/merchant/orders', requireMerchantRole('orders', 'admin'));

router.get('/api/merchant/orders', async (req, res) => {
  try {
    const payload = await listMerchantOrders(req.query.status, req.query.payment_status);
    res.json(payload);
  } catch (error) {
    const { status, body } = toClientErrorPayload(error, '無法載入訂單列表。');
    if (status >= 500) {
      logServerError('merchantOrders.list', error, { path: req.path });
    }
    res.status(status).json(body);
  }
});

router.get('/api/merchant/orders/:order_number', async (req, res) => {
  try {
    const order = await getMerchantOrder(req.params.order_number);
    res.json(toOrderResponse(order));
  } catch (error) {
    const { status, body } = toClientErrorPayload(error, '無法載入訂單。');
    if (status >= 500) {
      logServerError('merchantOrders.get', error, { path: req.path });
    }
    res.status(status).json(body);
  }
});

async function handleAction(req, res, handler) {
  try {
    const body = req.body;
    const validBody = body === undefined
      || (body !== null
        && typeof body === 'object'
        && !Array.isArray(body)
        && Object.keys(body).every((key) => ACTION_FIELDS.has(key))
        && (body.items === undefined
          || (Array.isArray(body.items)
            && body.items.every((item) => item
              && typeof item === 'object'
              && !Array.isArray(item)
              && Object.keys(item).every((key) => ACTION_ITEM_FIELDS.has(key))))));
    if (!validBody) {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST_BODY',
          message: '請求 body 含有不允許的欄位。',
        },
      });
    }
    const order = await handler(req.params.order_number);
    res.json(toOrderResponse(order));
  } catch (error) {
    const { status, body } = toClientErrorPayload(error, '無法更新訂單狀態。');
    if (status >= 500) {
      logServerError('merchantOrders.action', error, { path: req.path, method: req.method });
    }
    res.status(status).json(body);
  }
}

router.post('/api/merchant/orders/:order_number/accept', (req, res) =>
  handleAction(req, res, acceptMerchantOrder)
);

router.post('/api/merchant/orders/:order_number/start-preparing', (req, res) =>
  handleAction(req, res, startPreparingMerchantOrder)
);

router.post('/api/merchant/orders/:order_number/complete', (req, res) =>
  handleAction(req, res, completeMerchantOrder)
);

export default router;
