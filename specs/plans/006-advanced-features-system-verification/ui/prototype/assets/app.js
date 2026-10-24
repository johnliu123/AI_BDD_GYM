const STORAGE_KEY = 'prototype006-menu';

const seed = [
  { id: 'item-1', name: '招牌滷肉飯', price: '85.00', is_active: true },
  { id: 'item-2', name: '雙拼便當', price: '120.00', is_active: true },
];

function loadItems() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || seed.map((x) => ({ ...x }));
  } catch {
    return seed.map((x) => ({ ...x }));
  }
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function render() {
  const items = loadItems();
  const adminList = document.getElementById('admin-menu-list');
  const customerList = document.getElementById('customer-menu-list');
  adminList.innerHTML = '';
  customerList.innerHTML = '';

  items.forEach((item) => {
    const adminLi = document.createElement('li');
    adminLi.innerHTML = `<strong>${item.name}</strong> NT$ ${item.price}
      <button type="button" data-id="${item.id}" class="toggle">${item.is_active ? '標為售完' : '恢復供應'}</button>`;
    adminList.appendChild(adminLi);

    const custLi = document.createElement('li');
    custLi.className = item.is_active ? '' : 'sold-out';
    custLi.innerHTML = `<strong>${item.name}</strong> NT$ ${item.price}${item.is_active ? '' : '<span class="badge">售完</span>'}`;
    customerList.appendChild(custLi);
  });
}

document.getElementById('admin-menu-list').addEventListener('click', (event) => {
  const btn = event.target.closest('.toggle');
  if (!btn) return;
  const token = document.getElementById('merchant-token').value.trim();
  const rbacMsg = document.getElementById('rbac-message');
  if (token === 'orders-only') {
    rbacMsg.textContent = '權限不足：此 token 僅能操作訂單（403 MERCHANT_FORBIDDEN）。';
    rbacMsg.classList.remove('hidden');
    return;
  }
  rbacMsg.classList.add('hidden');
  const items = loadItems();
  const row = items.find((x) => x.id === btn.dataset.id);
  if (row) row.is_active = !row.is_active;
  saveItems(items);
  render();
});

document.getElementById('btn-add-item').addEventListener('click', () => {
  const name = window.prompt('餐點名稱', '新餐點');
  if (!name) return;
  const items = loadItems();
  items.push({ id: `item-${Date.now()}`, name, price: '99.00', is_active: true });
  saveItems(items);
  render();
});

render();
