import request from 'supertest';

export function sessionCookieValue(response) {
  const raw = response.headers['set-cookie']?.[0] ?? '';
  const pair = raw.split(';')[0];
  return pair.startsWith('guest_session=') ? pair.slice('guest_session='.length) : '';
}

export async function bootstrapCartSession(app, origin = 'http://localhost:5173') {
  const cartResponse = await request(app).get('/api/cart').set('Origin', origin);
  const cookie = sessionCookieValue(cartResponse);
  return {
    cookie,
    csrf: cartResponse.body.csrf_token,
    headers: {
      Origin: origin,
      Cookie: `guest_session=${cookie}`,
      'X-CSRF-Token': cartResponse.body.csrf_token,
    },
  };
}

export function pickMenuItemWithGroups(items) {
  return items.find((entry) => entry.option_groups && entry.option_groups.length > 0);
}

export function activeOptionIds(item) {
  return item.option_groups.flatMap((group) => group.options.filter((option) => option.is_active).slice(0, 1).map((option) => option.id));
}
