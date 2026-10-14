import test from 'node:test';
import assert from 'node:assert/strict';
import { assertProductionDatabaseConfigured } from '../../config/db.js';

test('assertProductionDatabaseConfigured rejects production without MSSQL env', () => {
  const previousEnv = process.env.NODE_ENV;
  const previousServer = process.env.MSSQL_SERVER;
  const previousDb = process.env.MSSQL_DATABASE;
  const previousUser = process.env.MSSQL_USER;
  const previousPassword = process.env.MSSQL_PASSWORD;

  process.env.NODE_ENV = 'production';
  delete process.env.MSSQL_SERVER;
  delete process.env.MSSQL_DATABASE;
  delete process.env.MSSQL_USER;
  delete process.env.MSSQL_PASSWORD;

  assert.throws(
    () => assertProductionDatabaseConfigured(),
    /MSSQL_SERVER/
  );

  process.env.NODE_ENV = previousEnv;
  if (previousServer === undefined) delete process.env.MSSQL_SERVER;
  else process.env.MSSQL_SERVER = previousServer;
  if (previousDb === undefined) delete process.env.MSSQL_DATABASE;
  else process.env.MSSQL_DATABASE = previousDb;
  if (previousUser === undefined) delete process.env.MSSQL_USER;
  else process.env.MSSQL_USER = previousUser;
  if (previousPassword === undefined) delete process.env.MSSQL_PASSWORD;
  else process.env.MSSQL_PASSWORD = previousPassword;
});

test('assertProductionDatabaseConfigured rejects PAYMENT_TEST_ABORT_AFTER_PENDING in production', () => {
  const previousEnv = process.env.NODE_ENV;
  const previousAbort = process.env.PAYMENT_TEST_ABORT_AFTER_PENDING;
  const previousServer = process.env.MSSQL_SERVER;
  const previousDb = process.env.MSSQL_DATABASE;
  const previousUser = process.env.MSSQL_USER;
  const previousPassword = process.env.MSSQL_PASSWORD;

  process.env.NODE_ENV = 'production';
  process.env.MSSQL_SERVER = 'localhost';
  process.env.MSSQL_DATABASE = 'test';
  process.env.MSSQL_USER = 'sa';
  process.env.MSSQL_PASSWORD = 'secret';
  process.env.PAYMENT_TEST_ABORT_AFTER_PENDING = '1';

  assert.throws(
    () => assertProductionDatabaseConfigured(),
    /PAYMENT_TEST_ABORT_AFTER_PENDING/
  );

  process.env.NODE_ENV = previousEnv;
  if (previousAbort === undefined) delete process.env.PAYMENT_TEST_ABORT_AFTER_PENDING;
  else process.env.PAYMENT_TEST_ABORT_AFTER_PENDING = previousAbort;
  if (previousServer === undefined) delete process.env.MSSQL_SERVER;
  else process.env.MSSQL_SERVER = previousServer;
  if (previousDb === undefined) delete process.env.MSSQL_DATABASE;
  else process.env.MSSQL_DATABASE = previousDb;
  if (previousUser === undefined) delete process.env.MSSQL_USER;
  else process.env.MSSQL_USER = previousUser;
  if (previousPassword === undefined) delete process.env.MSSQL_PASSWORD;
  else process.env.MSSQL_PASSWORD = previousPassword;
});
