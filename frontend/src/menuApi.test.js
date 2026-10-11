import test from 'node:test';
import assert from 'node:assert/strict';
import { loadMenuData } from './menuApi.js';

function jsonResponse(body, ok = true) {
  return {
    ok,
    json: async () => body,
  };
}

test('rejects failed API responses instead of treating them as an empty menu', async () => {
  const fetcher = async (url) =>
    url === '/api/categories'
      ? jsonResponse({ categories: [] })
      : jsonResponse({ error: 'unavailable' }, false);

  await assert.rejects(loadMenuData(fetcher), {
    message: 'MENU_DATA_REQUEST_FAILED',
  });
});

test('returns an empty menu when both API responses succeed with empty arrays', async () => {
  const data = await loadMenuData(async (url) =>
    url === '/api/categories'
      ? jsonResponse({ categories: [] })
      : jsonResponse({ items: [] })
  );

  assert.deepEqual(data, { categories: [], items: [] });
});

test('passes an abort signal to both API requests and rejects when cancelled', async () => {
  const controller = new AbortController();
  const receivedSignals = [];
  const fetcher = async (url, options) => {
    receivedSignals.push(options.signal);
    return new Promise((resolve, reject) => {
      options.signal.addEventListener(
        'abort',
        () => reject(new DOMException('The request was aborted.', 'AbortError')),
        { once: true }
      );
    });
  };

  const pending = loadMenuData(fetcher, { signal: controller.signal });
  controller.abort();

  await assert.rejects(pending, { name: 'AbortError' });
  assert.deepEqual(receivedSignals, [controller.signal, controller.signal]);
});