import { createMemoryPool } from './memoryDatabase.js';
import { isMssqlConfigured } from './mssqlConfig.js';
import { runMigrations } from '../data/migrate.js';
import { warnIfInvalidMerchantCredentialsJson } from './merchantCredentials.js';
import { refreshMenuCatalog } from '../repositories/menuRepository.js';

let pool;
let initPromise;

export function getPool() {
  if (!pool) {
    throw new Error('Database not initialized. Call ensureDatabaseReady() before getPool().');
  }
  return pool;
}

export function assertProductionDatabaseConfigured() {
  if (process.env.NODE_ENV === 'production' && !isMssqlConfigured()) {
    throw new Error(
      'MSSQL_SERVER, MSSQL_DATABASE, MSSQL_USER, and MSSQL_PASSWORD are required when NODE_ENV=production'
    );
  }
  if (process.env.NODE_ENV === 'production' && process.env.PAYMENT_TEST_ABORT_AFTER_PENDING === '1') {
    throw new Error('PAYMENT_TEST_ABORT_AFTER_PENDING must not be enabled when NODE_ENV=production');
  }
}

export async function ensureDatabaseReady() {
  if (!initPromise) {
    initPromise = (async () => {
      assertProductionDatabaseConfigured();
      warnIfInvalidMerchantCredentialsJson();
      if (!pool) {
        const useMemory = process.env.USE_MEMORY_DB === '1' || !isMssqlConfigured();
        if (useMemory) {
          pool = createMemoryPool();
        } else {
          const { createMssqlPool } = await import('./mssqlPool.js');
          pool = await createMssqlPool();
        }
      }
      await runMigrations(pool);
      await refreshMenuCatalog(pool);
    })();
  }
  return initPromise;
}

export const db = {
  get ready() {
    return Boolean(pool);
  },
  get name() {
    if (isMssqlConfigured() && process.env.USE_MEMORY_DB !== '1') {
      return 'mssql';
    }
    return 'memory-sql';
  },
};
