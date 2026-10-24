/**
 * TP-028：在 005 schema 已有訂單快照時套用 006 menu migration，確認 orders／明細保留。
 * 未設定 MSSQL_* 時 exit 0 skip；CI 見 .github/workflows/backend-ci.yml。
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import '../src/polyfills/nodePromiseWithResolvers.js';
import { getMssqlConfig, isMssqlConfigured } from '../src/config/mssqlConfig.js';

const migrationsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/data/migrations',
);

const PRIOR_ORDER = {
  sessionId: 'tp028-guest-session',
  orderId: '11111111-1111-4111-8111-111111111111',
  orderNumber: 'TP028-ORDER-001',
  itemId: '22222222-2222-4222-8222-222222222222',
  menuItemId: 'legacy-menu-item-1',
  menuItemName: '遷移前快照餐點',
  unitPrice: 220,
  lineTotal: 440,
  quantity: 2,
};

function loadStatements(fileName) {
  const sql = readFileSync(path.join(migrationsDir, fileName), 'utf8');
  return sql
    .split(';')
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function sortedMigrationFiles() {
  return readdirSync(migrationsDir)
    .filter((name) => name.endsWith('.mssql.sql'))
    .sort();
}

function getSmokeDatabaseName() {
  const base = getMssqlConfig().database;
  return process.env.MSSQL_MIGRATION_SMOKE_DATABASE || `${base}_TP028`;
}

function getSmokeConfig() {
  return { ...getMssqlConfig(), database: getSmokeDatabaseName() };
}

async function recreateSmokeDatabase() {
  const config = getSmokeConfig();
  const dbName = config.database;
  const sqlModule = await import('mssql');
  const sql = sqlModule.default ?? sqlModule;
  const master = await sql.connect({ ...config, database: 'master' });
  try {
    const safeName = dbName.replace(/]/g, ']]');
    const quoted = dbName.replace(/'/g, "''");
    await master.request().query(`
      IF DB_ID(N'${quoted}') IS NOT NULL
      BEGIN
        ALTER DATABASE [${safeName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
        DROP DATABASE [${safeName}];
      END
    `);
    await master.request().query(`CREATE DATABASE [${safeName}]`);
  } finally {
    await master.close();
  }
}

async function createPool() {
  const sqlModule = await import('mssql');
  const sql = sqlModule.default ?? sqlModule;
  const pool = await sql.connect(getSmokeConfig());
  return {
    async query(text) {
      const result = await pool.request().query(text);
      return { rows: result.recordset ?? [] };
    },
    async close() {
      await pool.close();
    },
  };
}

async function runMigrationFiles(pool, fileNames) {
  for (const file of fileNames) {
    for (const statement of loadStatements(file)) {
      await pool.query(statement);
    }
  }
}

async function seedPriorOrder(pool) {
  await pool.query(`
    INSERT INTO guest_sessions (session_id, csrf_token, created_at, last_activity_at)
    VALUES (N'${PRIOR_ORDER.sessionId}', N'tp028-csrf', SYSUTCDATETIME(), SYSUTCDATETIME());
  `);
  await pool.query(`
    INSERT INTO orders (
      id, guest_session_id, order_number, status, total_amount, payment_status, created_at
    ) VALUES (
      N'${PRIOR_ORDER.orderId}',
      N'${PRIOR_ORDER.sessionId}',
      N'${PRIOR_ORDER.orderNumber}',
      N'pending',
      ${PRIOR_ORDER.lineTotal},
      N'unpaid',
      '2026-10-01T00:00:00'
    );
  `);
  await pool.query(`
    INSERT INTO order_items (
      id, order_id, menu_item_id, menu_item_name, quantity, unit_price, line_total
    ) VALUES (
      N'${PRIOR_ORDER.itemId}',
      N'${PRIOR_ORDER.orderId}',
      N'${PRIOR_ORDER.menuItemId}',
      N'${PRIOR_ORDER.menuItemName}',
      ${PRIOR_ORDER.quantity},
      ${PRIOR_ORDER.unitPrice},
      ${PRIOR_ORDER.lineTotal}
    );
  `);
}

async function readOrderSnapshot(pool) {
  const orders = await pool.query(`
    SELECT order_number, total_amount, payment_status, status
    FROM orders WHERE id = N'${PRIOR_ORDER.orderId}'
  `);
  const items = await pool.query(`
    SELECT menu_item_id, menu_item_name, quantity, unit_price, line_total
    FROM order_items WHERE order_id = N'${PRIOR_ORDER.orderId}'
  `);
  const counts = await pool.query(`
    SELECT
      (SELECT COUNT(*) AS c FROM orders) AS order_count,
      (SELECT COUNT(*) AS c FROM order_items) AS item_count
  `);
  return { orders: orders.rows[0], items: items.rows[0], counts: counts.rows[0] };
}

delete process.env.USE_MEMORY_DB;

if (!isMssqlConfigured()) {
  console.log('smoke-mssql-028: skip (MSSQL_SERVER/DATABASE/USER/PASSWORD not set)');
  process.exit(0);
}

const allFiles = sortedMigrationFiles();
const through005 = allFiles.filter((name) => name < '006_menu_catalog.mssql.sql');
assert.ok(through005.length >= 5, 'expected migrations through 005');
assert.ok(allFiles.includes('006_menu_catalog.mssql.sql'), 'missing 006 migration');

await recreateSmokeDatabase();
const pool = await createPool();
try {
  await runMigrationFiles(pool, through005);
  await seedPriorOrder(pool);
  const before = await readOrderSnapshot(pool);

  await runMigrationFiles(pool, ['006_menu_catalog.mssql.sql']);
  const after = await readOrderSnapshot(pool);

  assert.equal(Number(before.counts.order_count), 1);
  assert.equal(Number(before.counts.item_count), 1);
  assert.deepEqual(after.orders, before.orders);
  assert.deepEqual(after.items, before.items);

  const menuTable = await pool.query(`
    SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'menu_items'
  `);
  assert.ok(menuTable.rows.length > 0, 'menu_items missing after 006');

  const seededMenu = await pool.query(`
    SELECT COUNT(*) AS c FROM menu_items WHERE id = N'item-1'
  `);
  assert.equal(Number(seededMenu.rows[0].c), 1, '006 seed menu item missing');
} finally {
  await pool.close();
}

console.log(
  `smoke-mssql-028: pass (DB ${getSmokeDatabaseName()}, prior order snapshot preserved after 006)`,
);
