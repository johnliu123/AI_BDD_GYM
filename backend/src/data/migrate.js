import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');

function loadMigrationStatements() {
  const files = readdirSync(migrationsDir)
    .filter((name) => name.endsWith('.mssql.sql'))
    .sort();

  return files.flatMap((file) => {
    const sql = readFileSync(path.join(migrationsDir, file), 'utf8');
    return sql
      .split(';')
      .map((chunk) => chunk.trim())
      .filter(Boolean);
  });
}

export async function runMigrations(pool) {
  if (pool.__memory) {
    await pool.initSchema();
    return;
  }

  for (const statement of loadMigrationStatements()) {
    await pool.query(statement);
  }
}

export async function resetCartData(pool) {
  await pool.query('DELETE FROM payment_idempotency_keys');
  await pool.query('DELETE FROM order_idempotency_keys');
  await pool.query('DELETE FROM order_item_options');
  await pool.query('DELETE FROM order_items');
  await pool.query('DELETE FROM orders');
  await pool.query('DELETE FROM cart_item_options');
  await pool.query('DELETE FROM cart_items');
  await pool.query('DELETE FROM carts');
  await pool.query('DELETE FROM guest_sessions');
}
