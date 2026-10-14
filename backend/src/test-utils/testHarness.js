import { ensureDatabaseReady, getPool } from '../config/db.js';
import { resetCartData } from '../data/migrate.js';
import { resetSessionCreationRateLimitForTests } from '../utils/sessionCreationRateLimit.js';

let ready = false;

export async function setupTestDatabase() {
  process.env.USE_MEMORY_DB = '1';
  process.env.MERCHANT_TOKEN = process.env.MERCHANT_TOKEN || 'test-merchant-token';
  if (!process.env.MERCHANT_CREDENTIALS) {
    process.env.MERCHANT_CREDENTIALS = JSON.stringify([
      { token: 'test-merchant-token', roles: ['admin'] },
      { token: 'test-orders-only', roles: ['orders'] },
      { token: 'test-menu-only', roles: ['menu'] },
    ]);
  }
  process.env.SESSION_CREATE_RATE_MAX = process.env.SESSION_CREATE_RATE_MAX || '100000';
  await ensureDatabaseReady();
  await resetSessionCreationRateLimitForTests();
  if (!ready) {
    ready = true;
  }
  await resetCartData(getPool());
}
