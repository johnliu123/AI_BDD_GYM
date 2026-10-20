import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import { activeOptionIds, bootstrapCartSession, pickMenuItemWithGroups } from '../testHelpers.js';

test.before(async () => {
  await setupTestDatabase();
});

const { default: app } = await import('../../server.js');

test('POST /api/cart/items rejects disabled option ids', async () => {
  const menuResponse = await request(app).get('/api/menu-items');
  const item = pickMenuItemWithGroups(menuResponse.body.items);
  const disabledOptionId = item.option_groups[0].options.find((option) => !option.is_active)?.id;
  const session = await bootstrapCartSession(app);

  const addResponse = await request(app)
    .post('/api/cart/items')
    .set(session.headers)
    .send({
      menu_item_id: item.id,
      quantity: 1,
      menu_item_option_ids: [disabledOptionId],
    });

  assert.equal(addResponse.status, 400);
  assert.equal(addResponse.body.error.code, 'INVALID_OPTION_SELECTION');
});

test('POST /api/cart/items rejects unknown option ids without mutating cart', async () => {
  const session = await bootstrapCartSession(app);
  const response = await request(app)
    .post('/api/cart/items')
    .set(session.headers)
    .send({
      menu_item_id: 'item-1',
      quantity: 1,
      menu_item_option_ids: ['opt-1', 'opt-4', 'opt-9', 'unknown-id'],
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'INVALID_OPTION_SELECTION');
  assert.equal(response.body.cart, undefined);

  const read = await request(app).get('/api/cart').set('Cookie', session.headers.Cookie);
  assert.equal(read.body.cart.items.length, 0);
});

test('POST /api/cart/items rejects client-supplied amounts without mutating cart', async () => {
  const session = await bootstrapCartSession(app);
  const response = await request(app)
    .post('/api/cart/items')
    .set(session.headers)
    .send({
      menu_item_id: 'item-1',
      quantity: 1,
      menu_item_option_ids: ['opt-1', 'opt-4'],
      unit_price: '0.01',
      line_total: '0.01',
      total_amount: '0.01',
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'INVALID_REQUEST_BODY');
  const read = await request(app).get('/api/cart').set('Cookie', session.headers.Cookie);
  assert.deepEqual(read.body.cart.items, []);
  assert.equal(read.body.cart.total, '0.00');
});

test('POST /api/cart/items adds item with 201 and BR-001 pricing', async () => {
  const menuResponse = await request(app).get('/api/menu-items');
  const item = pickMenuItemWithGroups(menuResponse.body.items);
  const selectedOptionIds = activeOptionIds(item);
  const session = await bootstrapCartSession(app);

  const addResponse = await request(app)
    .post('/api/cart/items')
    .set(session.headers)
    .send({
      menu_item_id: item.id,
      quantity: 1,
      menu_item_option_ids: selectedOptionIds,
    });

  assert.equal(addResponse.status, 201);
  assert.equal(addResponse.body.cart.items.length, 1);
  assert.equal(addResponse.body.cart.items[0].availability, 'available');
  assert.equal(addResponse.body.cart.items[0].line_total, item.price);
});

test('duplicate POST creates independent cart items', async () => {
  const menuResponse = await request(app).get('/api/menu-items');
  const item = pickMenuItemWithGroups(menuResponse.body.items);
  const selectedOptionIds = activeOptionIds(item);
  const session = await bootstrapCartSession(app);
  const body = {
    menu_item_id: item.id,
    quantity: 1,
    menu_item_option_ids: selectedOptionIds,
  };

  await request(app).post('/api/cart/items').set(session.headers).send(body);
  const second = await request(app).post('/api/cart/items').set(session.headers).send(body);

  assert.equal(second.status, 201);
  assert.equal(second.body.cart.items.length, 2);
  assert.notEqual(second.body.cart.items[0].id, second.body.cart.items[1].id);
});
