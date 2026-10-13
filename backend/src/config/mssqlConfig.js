export function isMssqlConfigured() {
  return Boolean(
    process.env.MSSQL_SERVER
    && process.env.MSSQL_DATABASE
    && process.env.MSSQL_USER
    && process.env.MSSQL_PASSWORD !== undefined
    && process.env.MSSQL_PASSWORD !== ''
  );
}

export function getMssqlConfig() {
  return {
    server: process.env.MSSQL_SERVER || 'localhost',
    port: Number(process.env.MSSQL_PORT || 1433),
    user: process.env.MSSQL_USER || 'sa',
    password: process.env.MSSQL_PASSWORD || '',
    database: process.env.MSSQL_DATABASE || 'AI_BDD_GYM',
    options: {
      encrypt: process.env.MSSQL_ENCRYPT !== 'false',
      trustServerCertificate: process.env.MSSQL_TRUST_SERVER_CERTIFICATE !== 'false',
    },
  };
}
