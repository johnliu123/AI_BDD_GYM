import test from 'node:test';
import assert from 'node:assert/strict';
import '../../polyfills/nodePromiseWithResolvers.js';

test('Promise.withResolvers polyfill resolves and rejects', async () => {
  assert.equal(typeof Promise.withResolvers, 'function');

  const { promise, resolve } = Promise.withResolvers();
  resolve(42);
  assert.equal(await promise, 42);

  const rejected = Promise.withResolvers();
  rejected.reject(new Error('expected'));
  await assert.rejects(rejected.promise, /expected/);
});
