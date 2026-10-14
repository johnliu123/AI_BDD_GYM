import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { attachGuestSession } from '../../middleware/guestSession.js';
import { readCart } from '../../services/cartService.js';
import { buildCartState } from '../../services/cartPricing.js';
import { formatMoney, addMoneyStrings } from '../../services/money.js';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import { createSessionRecord } from '../../repositories/guestSessionRepository.js';
import {
  insertOrderHeader,
  insertOrderItemRow,
  loadOrderByOrderNumber,
} from '../../repositories/orderRepository.js';
import { getPool } from '../../config/db.js';
import {
  addSampleCartItem,
  bootstrapCartSession,
  merchantGet,
  postCreateOrder,
} from '../testHelpers.js';

test.before(async () => {
  await setupTestDatabase();
});

const { default: app } = await import('../../server.js');

test('guest session middleware is a callable Express middleware', () => {
  assert.equal(typeof attachGuestSession, 'function');
  assert.equal(attachGuestSession.length, 3);
});

test('readCart exposes availability-aware cart state via buildCartState', async () => {
  const session = await createSessionRecord();
  const cart = await readCart(session.id);
  assert.deepEqual(cart, buildCartState([]));
  assert.equal(cart.total, '0.00');
  assert.deepEqual(cart.items, []);
});

test('money.js produces decimal strings for API snapshots', () => {
  assert.equal(formatMoney('120.5'), '120.50');
  assert.equal(addMoneyStrings('0.10', '0.20'), '0.30');
  assert.match(formatMoney(99), /^-?[0-9]+\.[0-9]{2}$/);
});

test('orderRepository loads order header and line snapshots by order number', async () => {
  const session = await createSessionRecord();
  const pool = getPool();
  const orderNumber = 'ORD-20261014-AABB0001';
  const orderId = await insertOrderHeader(session.id, orderNumber, '220.00', pool);
  await insertOrderItemRow(
    orderId,
    {
      menu_item_id: 'item-1',
      menu_item_name: '測試餐點',
      quantity: 1,
      unit_price: '220.00',
      line_total: '220.00',
      options: [],
    },
    pool
  );

  const order = await loadOrderByOrderNumber(orderNumber, pool);
  assert.equal(order.order_number, orderNumber);
  assert.equal(order.status, 'created');
  assert.equal(order.status_label, '已建立');
  assert.equal(order.payment_status, 'unpaid');
  assert.equal(order.payment_status_label, '未付款');
  assert.equal(order.total, '220.00');
  assert.equal(order.items.length, 1);
});

test('GET /api/orders returns payment fields after create (004 regression)', async () => {
  const session = await bootstrapCartSession(app);
  await addSampleCartItem(app, session);
  const created = await postCreateOrder(app, session);
  const orderNumber = created.body.order.order_number;

  const fetched = await request(app)
    .get(`/api/orders/${encodeURIComponent(orderNumber)}`)
    .set('Cookie', session.headers.Cookie);

  assert.equal(fetched.status, 200);
  assert.equal(fetched.body.order.payment_status, 'unpaid');
  assert.equal(fetched.body.order.payment_status_label, '未付款');
});

test('GET /api/merchant/orders still lists created orders with payment summary', async () => {
  const customer = await bootstrapCartSession(app);
  await addSampleCartItem(app, customer);
  const created = await postCreateOrder(app, customer);
  const listed = await merchantGet(app, '/api/merchant/orders');

  assert.equal(listed.status, 200);
  const row = listed.body.orders.find(
    (entry) => entry.order_number === created.body.order.order_number
  );
  assert.ok(row);
  assert.equal(row.payment_status, 'unpaid');
  assert.equal(row.payment_status_label, '未付款');
});
