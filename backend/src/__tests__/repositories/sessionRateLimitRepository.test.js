import test from 'node:test';
import assert from 'node:assert/strict';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import {
  consumeSessionCreationSlot,
  resetSessionCreationRateLimits,
} from '../../repositories/sessionRateLimitRepository.js';

test.before(async () => {
  await setupTestDatabase();
});

test('session creation rate limits are shared through the database store', async () => {
  const previousMax = process.env.SESSION_CREATE_RATE_MAX;
  process.env.SESSION_CREATE_RATE_MAX = '2';

  try {
    await resetSessionCreationRateLimits();
    const clientKey = 'shared-client-key';

    await consumeSessionCreationSlot(clientKey);
    await consumeSessionCreationSlot(clientKey);

    await assert.rejects(
      () => consumeSessionCreationSlot(clientKey),
      (error) => error.code === 'SESSION_CREATE_RATE_LIMITED'
    );
  } finally {
    if (previousMax === undefined) {
      delete process.env.SESSION_CREATE_RATE_MAX;
    } else {
      process.env.SESSION_CREATE_RATE_MAX = previousMax;
    }
    await resetSessionCreationRateLimits();
    await setupTestDatabase();
  }
});
