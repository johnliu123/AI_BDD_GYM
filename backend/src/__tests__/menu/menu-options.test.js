import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setupTestDatabase } from '../../test-utils/testHarness.js';

test.before(async () => {
  await setupTestDatabase();
});

const { default: app } = await import('../../server.js');

test('GET /api/menu-items includes option groups and decimal prices as strings', async () => {
  const response = await request(app).get('/api/menu-items');
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.items));
  assert.ok(response.body.items.length > 0);

  const meal = response.body.items.find((item) => item.option_groups && item.option_groups.length > 0);
  assert.ok(meal);
  assert.equal(typeof meal.price, 'string');
  assert.match(meal.price, /^\d+\.\d{2}$/);
  assert.ok(Array.isArray(meal.option_groups));
  assert.ok(meal.option_groups[0].options.length > 0);
  assert.equal(typeof meal.option_groups[0].options[0].price_adjustment, 'string');
  assert.match(meal.option_groups[0].options[0].price_adjustment, /^\d+\.\d{2}$/);
  assert.ok(meal.option_groups[0].options.some((option) => option.is_active === false));
});

test('GET /api/menu-items exposes meals with zero option groups', async () => {
  const response = await request(app).get('/api/menu-items');
  const noGroupItem = response.body.items.find((item) => item.id === 'item-3');
  assert.ok(noGroupItem);
  assert.deepEqual(noGroupItem.option_groups, []);
  assert.equal(typeof noGroupItem.price, 'string');
});

test('GET /api/menu-items includes multi-group meals with active flags on options', async () => {
  const response = await request(app).get('/api/menu-items');
  const multi = response.body.items.find((item) => item.id === 'item-1');
  assert.ok(multi);
  assert.equal(multi.option_groups.length, 2);
  assert.ok(multi.option_groups.every((group) => group.options.length > 0));
  assert.ok(multi.option_groups[0].options.some((option) => option.is_active === false));
});

test('GET /api/menu-items preserves string fidelity for fractional adjustments', async () => {
  const response = await request(app).get('/api/menu-items');
  const pasta = response.body.items.find((item) => item.id === 'item-2');
  const penne = pasta.option_groups[0].options.find((option) => option.id === 'opt-8');
  assert.equal(penne.price_adjustment, '5.00');
});
