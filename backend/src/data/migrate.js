import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');

function statementsFromFile(file) {
  const sql = readFileSync(path.join(migrationsDir, file), 'utf8');
  return sql
    .split(';')
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function migrationFiles() {
  return readdirSync(migrationsDir)
    .filter((name) => name.endsWith('.mssql.sql'))
    .sort();
}

export async function runMigrations(pool) {
  if (pool.__memory) {
    await pool.initSchema();
    return;
  }

  for (const file of migrationFiles()) {
    const statements = statementsFromFile(file);
    for (let index = 0; index < statements.length; index += 1) {
      const statement = statements[index];
      try {
        await pool.query(statement);
      } catch (error) {
        const preview = statement.replace(/\s+/g, ' ').slice(0, 120);
        const wrapped = new Error(
          `Migration ${file} statement ${index + 1}/${statements.length} failed: ${error.message} — ${preview}`,
        );
        wrapped.cause = error;
        throw wrapped;
      }
    }
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
