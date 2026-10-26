export function isMssqlConfigured() {
  return Boolean(
    process.env.MSSQL_SERVER
    && process.env.MSSQL_DATABASE
    && process.env.MSSQL_USER
    && process.env.MSSQL_PASSWORD !== undefined
    && process.env.MSSQL_PASSWORD !== ''
  );
}

function readTimeoutMs(envKey, fallbackMs) {
  const raw = process.env[envKey];
  if (raw === undefined || raw === '') {
    return fallbackMs;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackMs;
}

export function getMssqlConfig() {
  return {
    server: process.env.MSSQL_SERVER || 'localhost',
    port: Number(process.env.MSSQL_PORT || 1433),
    user: process.env.MSSQL_USER || 'sa',
    password: process.env.MSSQL_PASSWORD || '',
    database: process.env.MSSQL_DATABASE || 'AI_BDD_GYM',
    connectionTimeout: readTimeoutMs('MSSQL_CONNECTION_TIMEOUT_MS', 30_000),
    requestTimeout: readTimeoutMs('MSSQL_REQUEST_TIMEOUT_MS', 120_000),
    pool: {
      max: Number(process.env.MSSQL_POOL_MAX || 10),
      min: 0,
      idleTimeoutMillis: 30_000,
    },
    options: {
      encrypt: process.env.MSSQL_ENCRYPT !== 'false',
      trustServerCertificate: process.env.MSSQL_TRUST_SERVER_CERTIFICATE !== 'false',
    },
  };
}
