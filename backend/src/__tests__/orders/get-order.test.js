import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { menuItems } from '../../data/menuData.js';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import {
  addSampleCartItem,
  bootstrapCartSession,
  postCreateOrder,
} from '../testHelpers.js';

test.before(async () => {
  await setupTestDatabase();
});

const { default: app } = await import('../../server.js');

test('GET /api/orders/{order_number} returns snapshot for same session', async () => {
  const session = await bootstrapCartSession(app);
  await addSampleCartItem(app, session);
  const created = await postCreateOrder(app, session);
  const orderNumber = created.body.order.order_number;

  const fetched = await request(app)
    .get(`/api/orders/${encodeURIComponent(orderNumber)}`)
    .set('Cookie', session.headers.Cookie);

  assert.equal(fetched.status, 200);
  assert.equal(fetched.body.order.total, created.body.order.total);
  assert.equal(fetched.body.order.items[0].unit_price, created.body.order.items[0].unit_price);
});

test('GET /api/orders/{order_number} keeps snapshot after menu price changes', async () => {
  const menuItem = menuItems.find((item) => item.id === 'item-1');
  const session = await bootstrapCartSession(app);
  await addSampleCartItem(app, session);
  const created = await postCreateOrder(app, session);
  const orderNumber = created.body.order.order_number;
  const snapshotTotal = created.body.order.total;

  const previousPrice = menuItem.price;
  try {
    menuItem.price = '9999.00';
    const fetched = await request(app)
      .get(`/api/orders/${encodeURIComponent(orderNumber)}`)
      .set('Cookie', session.headers.Cookie);
    assert.equal(fetched.body.order.total, snapshotTotal);
  } finally {
    menuItem.price = previousPrice;
  }
});

test('GET /api/orders/{order_number} returns 404 for other session', async () => {
  const sessionA = await bootstrapCartSession(app);
  await addSampleCartItem(app, sessionA);
  const created = await postCreateOrder(app, sessionA);
  const orderNumber = created.body.order.order_number;

  const sessionB = await bootstrapCartSession(app);
  const fetched = await request(app)
    .get(`/api/orders/${encodeURIComponent(orderNumber)}`)
    .set('Cookie', sessionB.headers.Cookie);

  assert.equal(fetched.status, 404);
  assert.equal(fetched.body.error.code, 'ORDER_NOT_FOUND');
});

test('GET /api/orders/{order_number} returns 404 for unknown number', async () => {
  const session = await bootstrapCartSession(app);
  const fetched = await request(app)
    .get('/api/orders/ORD-20260101-00000000')
    .set('Cookie', session.headers.Cookie);
  assert.equal(fetched.status, 404);
  assert.equal(fetched.body.error.code, 'ORDER_NOT_FOUND');
});
