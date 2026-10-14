import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import {
  addSampleCartItem,
  bootstrapCartSession,
  setMenuItemActive,
  setMenuOptionActive,
} from '../testHelpers.js';

test.before(async () => {
  await setupTestDatabase();
});

const { default: app } = await import('../../server.js');

test('sold-out item rejects add to cart with CART_ITEM_UNAVAILABLE', async () => {
  const session = await bootstrapCartSession(app);
  await setMenuItemActive(app, 'item-3', false);
  try {
    const add = await request(app)
      .post('/api/cart/items')
      .set(session.headers)
      .send({ menu_item_id: 'item-3', quantity: 1, menu_item_option_ids: [] });
    assert.equal(add.status, 409);
    assert.equal(add.body.error.code, 'CART_ITEM_UNAVAILABLE');
  } finally {
    await setMenuItemActive(app, 'item-3', true);
  }
});

test('cart GET marks item unavailable after sold-out', async () => {
  const session = await bootstrapCartSession(app);
  await addSampleCartItem(app, session, 'item-3', []);
  await setMenuItemActive(app, 'item-3', false);
  try {
    const cart = await request(app).get('/api/cart').set('Cookie', session.headers.Cookie);
    assert.equal(cart.body.cart.items[0].availability, 'unavailable');
  } finally {
    await setMenuItemActive(app, 'item-3', true);
  }
});

test('inactive option rejects add with invalid selection', async () => {
  const session = await bootstrapCartSession(app);
  const add = await request(app)
    .post('/api/cart/items')
    .set(session.headers)
    .send({ menu_item_id: 'item-1', quantity: 1, menu_item_option_ids: ['opt-9', 'opt-4'] });
  assert.equal(add.status, 400);
  assert.equal(add.body.error.code, 'INVALID_OPTION_SELECTION');
});

test('restored item can be added again', async () => {
  const session = await bootstrapCartSession(app);
  await setMenuItemActive(app, 'item-4', false);
  await setMenuItemActive(app, 'item-4', true);
  const add = await request(app)
    .post('/api/cart/items')
    .set(session.headers)
    .send({ menu_item_id: 'item-4', quantity: 1, menu_item_option_ids: [] });
  assert.equal(add.status, 201);
});

test('option availability patch toggles option', async () => {
  await setMenuOptionActive(app, 'item-1', 'opt-2', false);
  const menu = await request(app).get('/api/menu-items');
  const item = menu.body.items.find((entry) => entry.id === 'item-1');
  const group = item.option_groups.find((g) => g.options.some((o) => o.id === 'opt-2'));
  const option = group.options.find((o) => o.id === 'opt-2');
  assert.equal(option.is_active, false);
  await setMenuOptionActive(app, 'item-1', 'opt-2', true);
});
