/**
 * 對真實 MSSQL 套用 migrations 後檢查 005 schema（pay/cancel 欄位與冪等表）。
 * 未設定 MSSQL_* 時 exit 0 skip；CI job 見 .github/workflows/backend-ci.yml。
 */
import assert from 'node:assert/strict';
import '../src/polyfills/nodePromiseWithResolvers.js';
import { getMssqlConfig, isMssqlConfigured } from '../src/config/mssqlConfig.js';
import { ensureDatabaseReady, getPool } from '../src/config/db.js';

delete process.env.USE_MEMORY_DB;

if (!isMssqlConfigured()) {
  console.log('smoke-mssql-005: skip (MSSQL_SERVER/DATABASE/USER/PASSWORD not set)');
  process.exit(0);
}

async function ensureTargetDatabase() {
  const config = getMssqlConfig();
  const dbName = config.database;
  const sqlModule = await import('mssql');
  const sql = sqlModule.default ?? sqlModule;
  const master = await sql.connect({ ...config, database: 'master' });
  try {
    const safeName = dbName.replace(/]/g, ']]');
    await master.request().query(
      `IF DB_ID(N'${dbName.replace(/'/g, "''")}') IS NULL CREATE DATABASE [${safeName}]`,
    );
  } finally {
    await master.close();
  }
}

await ensureTargetDatabase();
await ensureDatabaseReady();
const pool = getPool();
assert.equal(pool.__memory, undefined, 'expected MSSQL pool, not memory');

const columnCheck = await pool.query(
  `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'orders'
     AND COLUMN_NAME IN ('payment_status', 'refunded_at', 'paid_at')`,
);
const columns = new Set(columnCheck.rows.map((row) => row.COLUMN_NAME));
assert.ok(columns.has('payment_status'), 'orders.payment_status missing');
assert.ok(columns.has('refunded_at'), 'orders.refunded_at missing');
assert.ok(columns.has('paid_at'), 'orders.paid_at missing');

const tableCheck = await pool.query(
  `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
   WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'payment_idempotency_keys'`,
);
assert.ok(tableCheck.rows.length > 0, 'payment_idempotency_keys table missing');

console.log('smoke-mssql-005: pass (migrations applied, 005 schema present)');
