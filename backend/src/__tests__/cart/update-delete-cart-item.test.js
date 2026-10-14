import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import { bootstrapCartSession, setMenuOptionActive } from '../testHelpers.js';

test.before(async () => {
  await setupTestDatabase();
});

const { default: app } = await import('../../server.js');

test('PATCH rejects invalid quantities and unavailable items', async () => {
  const session = await bootstrapCartSession(app);

  const add = await request(app)
    .post('/api/cart/items')
    .set(session.headers)
    .send({
      menu_item_id: 'item-1',
      quantity: 1,
      menu_item_option_ids: ['opt-1', 'opt-4'],
    });

  const itemId = add.body.cart.items[0].id;

  const zero = await request(app).patch(`/api/cart/items/${itemId}`).set(session.headers).send({ quantity: 0 });
  assert.equal(zero.status, 400);

  await setMenuOptionActive(app, 'item-1', 'opt-1', false);
  const blocked = await request(app).patch(`/api/cart/items/${itemId}`).set(session.headers).send({ quantity: 2 });
  assert.equal(blocked.status, 409);
  assert.equal(blocked.body.error.code, 'CART_ITEM_UNAVAILABLE');
  await setMenuOptionActive(app, 'item-1', 'opt-1', true);

  const ok = await request(app).patch(`/api/cart/items/${itemId}`).set(session.headers).send({ quantity: 2 });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.cart.items[0].quantity, 2);
});

test('DELETE removes unavailable items and recalculates totals', async () => {
  const session = await bootstrapCartSession(app);

  const add = await request(app)
    .post('/api/cart/items')
    .set(session.headers)
    .send({
      menu_item_id: 'item-1',
      quantity: 1,
      menu_item_option_ids: ['opt-1', 'opt-4'],
    });

  const itemId = add.body.cart.items[0].id;
  await setMenuOptionActive(app, 'item-1', 'opt-1', false);

  const deleted = await request(app).delete(`/api/cart/items/${itemId}`).set(session.headers);
  assert.equal(deleted.status, 200);
  assert.equal(deleted.body.cart.items.length, 0);
  assert.equal(deleted.body.cart.total, '0.00');
  await setMenuOptionActive(app, 'item-1', 'opt-1', true);
});
