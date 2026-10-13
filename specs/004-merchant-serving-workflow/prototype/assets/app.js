const VALID_TOKEN = 'demo-token';
const storageKey = 'muhe-merchant-prototype-v4';

const labels = {
  created: '已建立',
  accepted: '已接單',
  preparing: '出餐中',
  completed: '已完成',
};

const seedOrders = () => [
  {
    order_number: 'ORD-20261014-A1B2C3D4',
    status: 'created',
    created_at: '2026-10-14T04:10:00.000Z',
    status_updated_at: '2026-10-14T04:10:00.000Z',
    total: '415.00',
    items: [
      { menu_item_name: '香煎雞腿排', quantity: 1, unit_price: '215.00', line_total: '215.00', options: [{ name: '加大' }] },
      { menu_item_name: '古早味滷肉飯', quantity: 1, unit_price: '150.00', line_total: '150.00', options: [] },
    ],
  },
  {
    order_number: 'ORD-20261014-B2C3D4E5',
    status: 'accepted',
    created_at: '2026-10-14T03:55:00.000Z',
    status_updated_at: '2026-10-14T04:00:00.000Z',
    total: '220.00',
    items: [{ menu_item_name: '慢燉牛肉飯', quantity: 1, unit_price: '220.00', line_total: '220.00', options: [] }],
  },
];

function loadState() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) return JSON.parse(raw);
  } catch (_) { /* ignore */ }
  return { orders: seedOrders(), selected: null };
}

function saveState(state) {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

let state = loadState();
let selectedNumber = state.selected;

const tokenInput = document.getElementById('merchant-token');
const statusFilter = document.getElementById('status-filter');
const orderList = document.getElementById('order-list');
const authMessage = document.getElementById('auth-message');
const detailTitle = document.getElementById('detail-title');
const detailBody = document.getElementById('detail-body');
const detailActions = document.getElementById('detail-actions');
const lookupNumber = document.getElementById('lookup-number');
const lookupBtn = document.getElementById('lookup-btn');
const lookupResult = document.getElementById('lookup-result');
const toast = document.getElementById('toast');

tokenInput.value = localStorage.getItem(`${storageKey}-token`) || VALID_TOKEN;

function isAuthed() {
  return tokenInput.value.trim() === VALID_TOKEN;
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2200);
}

function transition(order, next) {
  const allowed = {
    created: ['accepted'],
    accepted: ['preparing'],
    preparing: ['completed'],
    completed: [],
  };
  if (!allowed[order.status]?.includes(next)) {
    showToast('目前狀態無法執行此操作');
    return false;
  }
  order.status = next;
  order.status_updated_at = new Date().toISOString();
  saveState(state);
  return true;
}

function renderList() {
  orderList.innerHTML = '';
  if (!isAuthed()) {
    authMessage.textContent = '店家憑證無效，無法顯示訂單。';
    authMessage.classList.remove('hidden');
    return;
  }
  authMessage.classList.add('hidden');
  const filter = statusFilter.value;
  const rows = state.orders.filter((o) => !filter || o.status === filter);
  for (const o of rows) {
    const li = document.createElement('li');
    li.className = `order-card${o.order_number === selectedNumber ? ' active' : ''}`;
    li.innerHTML = `<strong>${o.order_number}</strong><div class="meta"><span class="badge">${labels[o.status]}</span><span>NT$ ${o.total}</span></div>`;
    li.addEventListener('click', () => {
      selectedNumber = o.order_number;
      state.selected = selectedNumber;
      saveState(state);
      renderDetail();
      renderList();
    });
    orderList.appendChild(li);
  }
}

function renderDetail() {
  const order = state.orders.find((o) => o.order_number === selectedNumber);
  if (!order) {
    detailTitle.textContent = '選擇一筆訂單';
    detailBody.innerHTML = '<p class="muted">點選左側訂單以檢視明細與操作。</p>';
    detailActions.classList.add('hidden');
    return;
  }
  detailTitle.textContent = order.order_number;
  const itemsHtml = order.items
    .map(
      (it) =>
        `<div class="line-item"><strong>${it.menu_item_name}</strong> × ${it.quantity}<br/>單價 ${it.unit_price} · 小計 ${it.line_total}${
          it.options?.length ? `<br/>規格：${it.options.map((x) => x.name).join('、')}` : ''
        }</div>`
    )
    .join('');
  detailBody.innerHTML = `<p><strong>狀態</strong> ${labels[order.status]}</p><p><strong>總額（快照）</strong> NT$ ${order.total}</p>${itemsHtml}`;
  detailActions.classList.remove('hidden');
  detailActions.innerHTML = '';
  const mk = (label, next, cls = '') => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    if (cls) b.classList.add(cls);
    b.addEventListener('click', () => {
      if (transition(order, next)) {
        showToast(`已更新為「${labels[next]}」`);
        renderList();
        renderDetail();
      }
    });
    return b;
  };
  if (order.status === 'created') detailActions.appendChild(mk('接單', 'accepted'));
  if (order.status === 'accepted') detailActions.appendChild(mk('開始出餐', 'preparing'));
  if (order.status === 'preparing') detailActions.appendChild(mk('完成訂單', 'completed', 'secondary'));
}

function runLookup() {
  const num = lookupNumber.value.trim();
  const order = state.orders.find((o) => o.order_number === num);
  if (!order) {
    lookupResult.innerHTML = '<span class="muted">找不到訂單。</span>';
    return;
  }
  lookupResult.innerHTML = `<strong>${order.order_number}</strong><br/>狀態：${labels[order.status]}<br/>總額（快照）：NT$ ${order.total}`;
}

tokenInput.addEventListener('input', () => {
  localStorage.setItem(`${storageKey}-token`, tokenInput.value);
  renderList();
  renderDetail();
});
statusFilter.addEventListener('change', renderList);
lookupBtn.addEventListener('click', runLookup);

renderList();
renderDetail();
