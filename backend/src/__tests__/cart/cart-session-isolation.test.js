import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import { activeOptionIds, bootstrapCartSession, pickMenuItemWithGroups } from '../testHelpers.js';

test.before(async () => {
  await setupTestDatabase();
});

const { default: app } = await import('../../server.js');

test('two sessions cannot read each other cart items', async () => {
  const menuResponse = await request(app).get('/api/menu-items');
  const item = pickMenuItemWithGroups(menuResponse.body.items);
  const selectedOptionIds = activeOptionIds(item);

  const sessionA = await bootstrapCartSession(app);
  await request(app)
    .post('/api/cart/items')
    .set(sessionA.headers)
    .send({
      menu_item_id: item.id,
      quantity: 1,
      menu_item_option_ids: selectedOptionIds,
    });

  const sessionB = await bootstrapCartSession(app);
  const readB = await request(app).get('/api/cart').set('Cookie', sessionB.headers.Cookie);

  assert.equal(readB.body.cart.items.length, 0);
  assert.equal(readB.body.cart.total, '0.00');
});
