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
    price: '220.00',
    is_active: true,
    created_at: '2026-10-01T00:00:00Z',
    option_groups: [
      {
        id: 'group-1',
        name: '烹調方式',
        is_required: true,
        options: [
          { id: 'opt-1', name: '原味', price_adjustment: '0.00', is_active: true },
          { id: 'opt-2', name: '辣香', price_adjustment: '10.00', is_active: true },
          { id: 'opt-3', name: '黑胡椒', price_adjustment: '15.00', is_active: true },
          { id: 'opt-9', name: '暫停販售', price_adjustment: '99.00', is_active: false },
        ],
      },
      {
        id: 'group-2',
        name: '附餐',
        is_required: true,
        options: [
          { id: 'opt-4', name: '無附餐', price_adjustment: '0.00', is_active: true },
          { id: 'opt-5', name: '馬鈴薯', price_adjustment: '20.00', is_active: true },
          { id: 'opt-6', name: '沙拉', price_adjustment: '30.00', is_active: true },
        ],
      },
    ],
  },
  {
    id: 'item-2',
    category_id: 'cat-1',
    name: '海鮮義大利麵',
    image_url: null,
    price: '260.00',
    is_active: true,
    created_at: '2026-10-01T00:00:00Z',
    option_groups: [
      {
        id: 'group-3',
        name: '麵體',
        is_required: true,
        options: [
          { id: 'opt-7', name: '細麵', price_adjustment: '0.00', is_active: true },
          { id: 'opt-8', name: '筆管麵', price_adjustment: '5.00', is_active: true },
        ],
      },
    ],
  },
  {
    id: 'item-3',
    category_id: 'cat-2',
    name: '田園沙拉',
    image_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=800&q=80',
    price: '180.00',
    is_active: true,
    created_at: '2026-10-01T00:00:00Z',
    option_groups: [],
  },
  {
    id: 'item-4',
    category_id: 'cat-3',
    name: '檸檬氣泡水',
    image_url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&q=80',
    price: '85.00',
    is_active: true,
    created_at: '2026-10-01T00:00:00Z',
    option_groups: [],
  },
];
