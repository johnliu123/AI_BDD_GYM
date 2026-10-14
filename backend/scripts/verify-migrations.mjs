/**
 * 驗證 migrations/*.mssql.sql 可解析，且 005 含預期 DDL（無需連線 MSSQL）。
 * CI 預設執行；見 specs/005-payment-order-cancellation/techstack.md §005 smoke。
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const migrationsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/data/migrations',
);

function loadStatements(fileName) {
  const sql = readFileSync(path.join(migrationsDir, fileName), 'utf8');
  return sql
    .split(';')
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

const files = readdirSync(migrationsDir)
  .filter((name) => name.endsWith('.mssql.sql'))
  .sort();

assert.ok(files.length >= 6, 'expected at least 006 migrations');
assert.ok(files.includes('006_menu_catalog.mssql.sql'), 'missing 006_menu_catalog.mssql.sql');
assert.ok(files.includes('005_payment_cancel.mssql.sql'), 'missing 005_payment_cancel.mssql.sql');

for (const file of files) {
  const statements = loadStatements(file);
  assert.ok(statements.length > 0, `${file} has no statements`);
}

const requiredIn005 = [
  'payment_status',
  'payment_idempotency_keys',
  'refunded_at',
  'cancelled_at',
  'idx_orders_payment_status_created',
];

const migration005 = readFileSync(path.join(migrationsDir, '005_payment_cancel.mssql.sql'), 'utf8');
for (const token of requiredIn005) {
  assert.ok(migration005.includes(token), `005 migration missing: ${token}`);
}

const requiredIn006 = ['categories', 'menu_items', 'menu_item_option_groups', 'menu_item_options'];
const migration006 = readFileSync(path.join(migrationsDir, '006_menu_catalog.mssql.sql'), 'utf8');
for (const token of requiredIn006) {
  assert.ok(migration006.includes(token), `006 migration missing: ${token}`);
}

console.log(`verify-migrations: pass (${files.length} files, 005/006 DDL tokens ok)`);
