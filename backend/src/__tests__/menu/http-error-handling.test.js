import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { setupTestDatabase } from '../../test-utils/testHarness.js';
import { bootstrapCartSession, createSampleOrder, merchantPost } from '../testHelpers.js';

process.env.ENABLE_HTTP_ERROR_TEST_ROUTES = '1';

test.before(async () => {
  await setupTestDatabase();
});

const { default: app } = await import('../../server.js');

test('unknown route returns 404 NOT_FOUND JSON', async () => {
  const response = await request(app).get('/api/no-such-route');
  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, 'NOT_FOUND');
});

test('invalid JSON body returns 400 INVALID_REQUEST_BODY', async () => {
  const response = await request(app)
    .post('/api/merchant/categories')
    .set('Content-Type', 'application/json')
    .set('X-Merchant-Token', 'test-merchant-token')
    .send('{');
  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'INVALID_REQUEST_BODY');
});

test('internal error is sanitized, logged locally, and makes no remote call', async () => {
  const originalConsoleError = console.error;
  const originalFetch = globalThis.fetch;
  const logLines = [];
  let remoteCalls = 0;
  console.error = (line) => logLines.push(String(line));
  globalThis.fetch = async () => {
    remoteCalls += 1;
    throw new Error('unexpected remote call');
  };
  let response;
  try {
    response = await request(app)
      .get('/api/_test/internal-error')
      .query({ message: 'SELECT * FROM private_table password=hidden C:\\private\\service.js' });
  } finally {
    console.error = originalConsoleError;
    globalThis.fetch = originalFetch;
  }

  assert.equal(response.status, 500);
  assert.equal(response.body.error.code, 'INTERNAL_ERROR');
  assert.equal(response.body.error.message, '伺服器錯誤');
  assert.equal(JSON.stringify(response.body).includes('SELECT'), false);
  assert.equal(JSON.stringify(response.body).includes('hidden'), false);
  assert.equal(JSON.stringify(response.body).includes('service.js'), false);
  assert.equal(response.body.error.stack, undefined);
  assert.equal(logLines.length, 1);
  assert.match(logLines[0], /http\.unhandled/);
  assert.match(logLines[0], /SELECT \* FROM private_table/);
  assert.match(logLines[0], /password=\[REDACTED\]/);
  assert.equal(remoteCalls, 0);
});

test('ORDER_STATUS_CONFLICT still returned for illegal transition', async () => {
  const session = await bootstrapCartSession(app);
  const created = await createSampleOrder(app, session);
  const orderNumber = created.body.order.order_number;
  await merchantPost(app, `/api/merchant/orders/${orderNumber}/accept`);
  const again = await merchantPost(app, `/api/merchant/orders/${orderNumber}/accept`);
  assert.equal(again.status, 409);
  assert.equal(again.body.error.code, 'ORDER_STATUS_CONFLICT');
});
