export const categories = [
  { id: 'cat-1', name: '主餐', sort_order: 1 },
  { id: 'cat-2', name: '輕食', sort_order: 2 },
  { id: 'cat-3', name: '飲品', sort_order: 3 },
];

export const menuItems = [
  {
    id: 'item-1',
    category_id: 'cat-1',
    name: '香蒜嫩雞',
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    price: 220,
    is_active: true,
    created_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'item-2',
    category_id: 'cat-1',
    name: '海鮮義大利麵',
    image_url: null,
    price: 260,
    is_active: true,
    created_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'item-3',
    category_id: 'cat-2',
    name: '田園沙拉',
    image_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=800&q=80',
    price: 180,
    is_active: true,
    created_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'item-4',
    category_id: 'cat-3',
    name: '檸檬氣泡水',
    image_url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80',
    price: 85,
    is_active: true,
    created_at: '2026-10-01T00:00:00Z',
  },
];
