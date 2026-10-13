import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setupTestDatabase } from '../test-utils/testHarness.js';

test.before(async () => {
  await setupTestDatabase();
});

const { default: app } = await import('../server.js');

test('GET /api/categories returns categories list', async () => {
  const response = await request(app).get('/api/categories');
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.categories));
  assert.ok(response.body.categories.length > 0);
});

test('GET /api/menu-items returns item data with category name and snake_case keys', async () => {
  const response = await request(app).get('/api/menu-items');
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.items));
  assert.ok(response.body.items.length > 0);
  const item = response.body.items[0];
  assert.ok(item.name);
  assert.ok(item.image_url || item.image_url === null);
  assert.ok(typeof item.price === 'number' || typeof item.price === 'string');
  assert.ok(item.category_name);
  assert.ok(!('categoryName' in item));
  assert.ok(!('imageUrl' in item));
});
