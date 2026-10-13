import '../polyfills/nodePromiseWithResolvers.js';
import { getMssqlConfig } from './mssqlConfig.js';

function toMssqlText(text) {
  return text.replace(/\$(\d+)/g, '@p$1');
}

function bindParams(request, params = []) {
  params.forEach((value, index) => {
    request.input(`p${index + 1}`, value);
  });
}

function mapResult(result) {
  return {
    rows: result.recordset ?? [],
    rowCount: result.rowsAffected?.[0] ?? result.recordset?.length ?? 0,
  };
}

export async function createMssqlPool() {
  const sqlModule = await import('mssql');
  const sql = sqlModule.default ?? sqlModule;
  const pool = await sql.connect(getMssqlConfig());
  const adapter = {
    __mssql: true,
    async query(text, params = []) {
      const request = pool.request();
      bindParams(request, params);
      const result = await request.query(toMssqlText(text));
      return mapResult(result);
    },
    async connect() {
      const transaction = new sql.Transaction(pool);
      await transaction.begin();
      return {
        async query(text, params = []) {
          const request = new sql.Request(transaction);
          bindParams(request, params);
          const result = await request.query(toMssqlText(text));
          return mapResult(result);
        },
        release() {},
        async commit() {
          await transaction.commit();
        },
        async rollback() {
          await transaction.rollback();
        },
      };
    },
  };

  return adapter;
}

export async function closeMssqlPool() {
  const sqlModule = await import('mssql');
  const sql = sqlModule.default ?? sqlModule;
  await sql.close();
}
