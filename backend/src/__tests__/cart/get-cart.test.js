import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import { bootstrapCartSession, setMenuOptionActive } from '../testHelpers.js';

test.before(async () => {
  await setupTestDatabase();
});

const { default: app } = await import('../../server.js');

test('GET /api/cart returns empty cart with zero total', async () => {
  const session = await bootstrapCartSession(app);
  const read = await request(app).get('/api/cart').set('Cookie', session.headers.Cookie);
  assert.deepEqual(read.body.cart.items, []);
  assert.equal(read.body.cart.total, '0.00');
});

test('GET /api/cart recalculates precision-sensitive totals', async () => {
  const session = await bootstrapCartSession(app);
  const add = await request(app)
    .post('/api/cart/items')
    .set(session.headers)
    .send({
      menu_item_id: 'item-1',
      quantity: 3,
      menu_item_option_ids: ['opt-1', 'opt-4'],
    });
  assert.equal(add.status, 201);

  const read = await request(app).get('/api/cart').set('Cookie', session.headers.Cookie);
  const lineItem = read.body.cart.items[0];
  assert.equal(lineItem.unit_price, '220.00');
  assert.equal(lineItem.line_total, '660.00');
  assert.equal(read.body.cart.total, '660.00');
});

test('GET /api/cart marks unavailable items without amounts', async () => {
  const session = await bootstrapCartSession(app);

  try {
    await request(app)
      .post('/api/cart/items')
      .set(session.headers)
      .send({
        menu_item_id: 'item-1',
        quantity: 1,
        menu_item_option_ids: ['opt-1', 'opt-4'],
      });

    await setMenuOptionActive(app, 'item-1', 'opt-1', false);
    const read = await request(app).get('/api/cart').set('Cookie', session.headers.Cookie);
    assert.equal(read.body.cart.items[0].availability, 'unavailable');
    assert.equal(read.body.cart.items[0].unit_price, undefined);
    assert.equal(read.body.cart.total, '0.00');
  } finally {
    await setMenuOptionActive(app, 'item-1', 'opt-1', true);
  }
});
