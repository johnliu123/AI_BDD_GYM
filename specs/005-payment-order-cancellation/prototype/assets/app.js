const VALID_TOKEN = 'demo-token';
const storageKey = 'muhe-payment-prototype-v5';

const statusLabels = {
  created: '已建立',
  accepted: '已接單',
  preparing: '出餐中',
  completed: '已完成',
  cancelled: '已取消',
};

const paymentLabels = {
  unpaid: '未付款',
  pending: '付款處理中',
  paid: '已付款',
  failed: '付款失敗',
  refunded: '已退款',
};

const seedOrders = () => [
  {
    order_number: 'ORD-20261014-A1B2C3D4',
    status: 'created',
    payment_status: 'unpaid',
    payment_failure_reason: null,
    created_at: '2026-10-14T04:10:00.000Z',
    total: '415.00',
    items: [{ menu_item_name: '香煎雞腿排', quantity: 1, line_total: '215.00' }],
  },
  {
    order_number: 'ORD-20261014-B2C3D4E5',
    status: 'accepted',
    payment_status: 'paid',
    payment_failure_reason: null,
    created_at: '2026-10-14T03:55:00.000Z',
    total: '220.00',
    items: [{ menu_item_name: '慢燉牛肉飯', quantity: 1, line_total: '220.00' }],
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
const paymentFilter = document.getElementById('payment-filter');
const orderList = document.getElementById('order-list');
const authMessage = document.getElementById('auth-message');
const detailTitle = document.getElementById('detail-title');
const detailBody = document.getElementById('detail-body');
const detailActions = document.getElementById('detail-actions');
const lookupNumber = document.getElementById('lookup-number');
const lookupBtn = document.getElementById('lookup-btn');
const lookupResult = document.getElementById('lookup-result');
const customerActions = document.getElementById('customer-actions');
const simulateFail = document.getElementById('simulate-fail');
const toast = document.getElementById('toast');

tokenInput.value = localStorage.getItem(`${storageKey}-token`) || VALID_TOKEN;

function findOrder(num) {
  return state.orders.find((o) => o.order_number === num);
}

function isAuthed() {
  return tokenInput.value.trim() === VALID_TOKEN;
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2200);
}

function renderList() {
  orderList.innerHTML = '';
  if (!isAuthed()) {
    authMessage.textContent = '店家憑證無效';
    authMessage.classList.remove('hidden');
    return;
  }
  authMessage.classList.add('hidden');
  const sf = statusFilter.value;
  const pf = paymentFilter.value;
  state.orders
    .filter((o) => (!sf || o.status === sf) && (!pf || o.payment_status === pf))
    .forEach((o) => {
      const li = document.createElement('li');
      li.className = `order-card${o.order_number === selectedNumber ? ' active' : ''}`;
      li.innerHTML = `<strong>${o.order_number}</strong>
        <div class="meta"><span><span class="badge">${statusLabels[o.status]}</span><span class="badge ${o.payment_status === 'failed' ? 'pay-failed' : ''} ${o.payment_status === 'paid' ? 'pay-paid' : ''}">${paymentLabels[o.payment_status]}</span></span><span>${o.total}</span></div>`;
      li.onclick = () => {
        selectedNumber = o.order_number;
        state.selected = selectedNumber;
        saveState(state);
        renderDetail();
        renderList();
      };
      orderList.appendChild(li);
    });
}

function renderDetail() {
  detailActions.innerHTML = '';
  const o = selectedNumber ? findOrder(selectedNumber) : null;
  if (!o) {
    detailTitle.textContent = '選擇一筆訂單';
    detailBody.textContent = '點選左側訂單以檢視付款與出餐狀態。';
    detailBody.classList.add('muted');
    detailActions.classList.add('hidden');
    return;
  }
  detailTitle.textContent = o.order_number;
  detailBody.classList.remove('muted');
  detailBody.innerHTML = `<p>出餐：<strong>${statusLabels[o.status]}</strong> · 付款：<strong>${paymentLabels[o.payment_status]}</strong></p>
    <p>總額快照：<strong>${o.total}</strong></p>
    ${o.payment_failure_reason ? `<p class="pay-failed">失敗原因：${o.payment_failure_reason}</p>` : ''}`;
  detailActions.classList.remove('hidden');
  if (o.status === 'cancelled') {
    showToast('已取消訂單不可接單');
    return;
  }
  if (o.status === 'created') {
    const accept = document.createElement('button');
    accept.textContent = '接單';
    accept.onclick = () => {
      o.status = 'accepted';
      saveState(state);
      renderList();
      renderDetail();
      showToast('已接單');
    };
    detailActions.appendChild(accept);
  }
}

function renderCustomer(order) {
  customerActions.innerHTML = '';
  if (!order) {
    lookupResult.textContent = '找不到訂單（本雛形僅含種子編號）。';
    customerActions.classList.add('hidden');
    return;
  }
  lookupResult.innerHTML = `<p><strong>${order.order_number}</strong></p>
    <p>出餐 ${statusLabels[order.status]} · 付款 ${paymentLabels[order.payment_status]}</p>
    <p>總額 ${order.total}</p>
    ${order.payment_failure_reason ? `<p>失敗：${order.payment_failure_reason}</p>` : ''}`;
  customerActions.classList.remove('hidden');

  const canPay = order.status !== 'cancelled' && ['unpaid', 'failed'].includes(order.payment_status);
  const canCancel = order.status === 'created' && order.payment_status !== 'pending';

  if (canPay) {
    const pay = document.createElement('button');
    pay.textContent = '付款';
    pay.onclick = () => {
      order.payment_status = 'pending';
      renderCustomer(order);
      setTimeout(() => {
        if (simulateFail.checked) {
          order.payment_status = 'failed';
          order.payment_failure_reason = '模擬付款失敗';
          simulateFail.checked = false;
          showToast('付款失敗');
        } else {
          order.payment_status = 'paid';
          order.payment_failure_reason = null;
          showToast('付款成功');
        }
        saveState(state);
        renderList();
        renderCustomer(order);
      }, 400);
    };
    customerActions.appendChild(pay);
  }

  if (canCancel) {
    const cancel = document.createElement('button');
    cancel.className = 'danger';
    cancel.textContent = '取消訂單';
    cancel.onclick = () => {
      if (order.payment_status === 'paid') order.payment_status = 'refunded';
      order.status = 'cancelled';
      saveState(state);
      renderList();
      renderCustomer(order);
      showToast('訂單已取消');
    };
    customerActions.appendChild(cancel);
  }
}

lookupBtn.onclick = () => {
  const num = lookupNumber.value.trim().toUpperCase();
  renderCustomer(findOrder(num));
};

tokenInput.addEventListener('change', () => {
  localStorage.setItem(`${storageKey}-token`, tokenInput.value);
  renderList();
  renderDetail();
});
statusFilter.onchange = paymentFilter.onchange = () => renderList();

renderList();
renderDetail();
if (state.orders[0]) lookupNumber.value = state.orders[0].order_number;
