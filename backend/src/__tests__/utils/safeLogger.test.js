import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeError } from '../../utils/safeLogger.js';

test('sanitizeError redacts server names and passwords from messages', () => {
  const error = new Error('Failed to connect to LAPTOP-ABC\\SQLEXPRESS in 15000ms');
  error.code = 'ETIMEOUT';

  const sanitized = sanitizeError(error);
  assert.equal(sanitized.code, 'ETIMEOUT');
  assert.match(sanitized.message, /\[REDACTED_SERVER\]/);
  assert.doesNotMatch(sanitized.message, /LAPTOP-ABC/);
  assert.equal(sanitized.stack, undefined);
});

test('sanitizeError redacts password fragments', () => {
  const error = new Error('Login failed for user sa; password=SuperSecret123');
  const sanitized = sanitizeError(error);
  assert.match(sanitized.message, /password=\[REDACTED\]/);
  assert.doesNotMatch(sanitized.message, /SuperSecret123/);
});
