import test from 'node:test';
import assert from 'node:assert/strict';
import { attachGuestSession } from '../../middleware/guestSession.js';
import { readCart } from '../../services/cartService.js';
import { buildCartState } from '../../services/cartPricing.js';
import { formatMoney, addMoneyStrings } from '../../services/money.js';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import { createSessionRecord } from '../../repositories/guestSessionRepository.js';

test.before(async () => {
  await setupTestDatabase();
});

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
