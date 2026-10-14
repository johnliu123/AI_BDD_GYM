import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAddToCartPayload,
  isOptionSelectionComplete,
  loadMenuData,
  loadPublicMenuItems,
} from './menuApi.js';

function jsonResponse(body, ok = true) {
  return {
    ok,
    json: async () => body,
  };
}

test('loadPublicMenuItems throws server error message instead of returning empty items', async () => {
  const fetcher = async () => jsonResponse({ error: { message: '載入餐點失敗。' } }, false);

  await assert.rejects(loadPublicMenuItems(fetcher), {
    message: '載入餐點失敗。',
  });
});

test('loadPublicMenuItems rejects successful responses without an items array', async () => {
  const fetcher = async () => jsonResponse({ not_items: [] });

  await assert.rejects(loadPublicMenuItems(fetcher), {
    message: 'INVALID_MENU_DATA_RESPONSE',
  });
});

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

test('option selection helpers enforce one choice per group and inactive items', () => {
  const item = {
    id: 'item-1',
    is_active: true,
    option_groups: [
      { id: 'g1', options: [{ id: 'o1', is_active: true }] },
      { id: 'g2', options: [{ id: 'o2', is_active: true }] },
    ],
  };

  assert.equal(isOptionSelectionComplete(item.option_groups, {}), false);
  assert.equal(isOptionSelectionComplete(item.option_groups, { g1: 'o1' }), false);
  assert.equal(isOptionSelectionComplete(item.option_groups, { g1: 'o1', g2: 'o2' }), true);

  const incomplete = buildAddToCartPayload(item, { g1: 'o1' });
  assert.equal(incomplete.error, 'INCOMPLETE_OPTION_SELECTION');

  const inactive = buildAddToCartPayload({ ...item, is_active: false }, { g1: 'o1', g2: 'o2' });
  assert.equal(inactive.error, 'ITEM_UNAVAILABLE');

  const ready = buildAddToCartPayload(item, { g1: 'o1', g2: 'o2' });
  assert.deepEqual(ready.payload.menu_item_option_ids, ['o1', 'o2']);
});