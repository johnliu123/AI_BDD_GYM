const initialMeals = [
  {
    id: 'chicken',
    name: '香煎雞腿排',
    category: '主餐',
    description: '香料醃製，搭配當季時蔬與米飯。',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
    available: true,
    price: 180,
    groups: [
      { id: 'portion', name: '份量', options: [{ id: 'regular', label: '標準', extra: 0 }, { id: 'large', label: '加大', extra: 35 }] },
      { id: 'side', name: '配菜', options: [{ id: 'greens', label: '季節時蔬', extra: 0 }, { id: 'potato', label: '香料薯塊', extra: 20 }] }
    ]
  },
  {
    id: 'rice',
    name: '古早味滷肉飯',
    category: '主餐',
    description: '滷汁入味，搭配白米飯。',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
    available: true,
    price: 150,
    groups: []
  },
  {
    id: 'beef',
    name: '慢燉牛肉飯',
    category: '主餐',
    description: '以洋蔥與香料慢燉，醬汁濃郁。',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80',
    available: true,
    price: 220,
    groups: [
      { id: 'portion', name: '份量', options: [{ id: 'regular', label: '標準', extra: 0 }, { id: 'large', label: '加大', extra: 40 }] },
      { id: 'egg', name: '加點', options: [{ id: 'none', label: '不加點', extra: 0 }, { id: 'egg', label: '溫泉蛋', extra: 25 }] }
    ]
  },
  {
    id: 'salad',
    name: '柑橘時蔬沙拉',
    category: '輕食',
    description: '脆甜生菜、烤南瓜與柑橘油醋。',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=900&q=80',
    available: true,
    price: 135,
    groups: [{ id: 'protein', name: '加點', options: [{ id: 'none', label: '不加點', extra: 0 }, { id: 'chicken', label: '舒肥雞肉', extra: 45 }] }]
  },
  {
    id: 'soup',
    name: '奶油野菇湯',
    category: '輕食',
    description: '今日暫停供應。',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
    available: false,
    price: 95,
    groups: [{ id: 'size', name: '份量', options: [{ id: 'regular', label: '單份', extra: 0 }, { id: 'large', label: '分享份', extra: 30 }] }]
  }
];

const storageKey = 'muhe-cart-prototype-v3-orders';
const defaults = {
  cart: [],
  cartsBySession: { 'visitor-a': [], 'visitor-b': [] },
  ordersBySession: { 'visitor-a': [], 'visitor-b': [] },
  idempotencyKeys: {},
  visitorSessionId: 'visitor-a',
  sessionExpired: false,
  meals: initialMeals,
  pricingError: false,
  view: 'menu',
  lastOrderNumber: null
};
let state = loadState();
let activeCategory = '全部';
let selectedMealId = null;

const menuGrid = document.getElementById('menu-grid');
const categoryFilters = document.getElementById('category-filters');
const cartContent = document.getElementById('cart-content');
const cartAlert = document.getElementById('cart-alert');
const dialog = document.getElementById('item-dialog');
const dialogContent = document.getElementById('dialog-content');

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (!saved || !Array.isArray(saved.cart) || !Array.isArray(saved.meals)) return structuredClone(defaults);
    return { ...structuredClone(defaults), ...saved };
  } catch {
    return structuredClone(defaults);
  }
}

function saveState() {
  state.cartsBySession[state.visitorSessionId] = state.cart;
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function getMeal(mealId) {
  return state.meals.find((meal) => meal.id === mealId);
}

function getSelectedOptions(meal, optionIds) {
  return meal.groups.map((group) => ({
    group: group.name,
    option: group.options.find((option) => option.id === optionIds[group.id])
  })).filter((selection) => selection.option);
}

function getUnitPrice(meal, optionIds) {
  return meal.price + getSelectedOptions(meal, optionIds).reduce((sum, selection) => sum + selection.option.extra, 0);
}

function getLineAvailability(line) {
  const meal = getMeal(line.mealId);
  if (!meal || !meal.available) return { available: false, reason: '餐點目前已暫停供應' };
  const invalidOption = meal.groups.some((group) => {
    const selectedId = line.optionIds[group.id];
    const option = group.options.find((entry) => entry.id === selectedId);
    return !option || option.available === false;
  });
  return invalidOption
    ? { available: false, reason: '所選規格目前已失效' }
    : { available: true, reason: '' };
}

function getCartTotal() {
  return state.cart.reduce((sum, line) => {
    const meal = getMeal(line.mealId);
    return meal && getLineAvailability(line).available
      ? sum + getUnitPrice(meal, line.optionIds) * line.quantity
      : sum;
  }, 0);
}

function render() {
  renderCategories();
  renderMeals();
  renderCart();
  renderOrderSuccess();
  renderNavigation();
  document.getElementById('menu-view').classList.toggle('hidden', state.view !== 'menu');
  document.getElementById('cart-view').classList.toggle('hidden', state.view !== 'cart');
  document.getElementById('order-success-view').classList.toggle('hidden', state.view !== 'order-success');
  document.getElementById('order-lookup-view').classList.toggle('hidden', state.view !== 'order-lookup');
  document.querySelectorAll('[data-view]').forEach((button) => button.classList.toggle('active', button.dataset.view === state.view && button.classList.contains('nav-link')));
  saveState();
}

function sessionOrders() {
  if (!state.ordersBySession[state.visitorSessionId]) state.ordersBySession[state.visitorSessionId] = [];
  return state.ordersBySession[state.visitorSessionId];
}

function generateOrderNumber() {
  const d = new Date();
  const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
  const hex = Array.from(crypto.getRandomValues(new Uint8Array(4))).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  return `ORD-${ymd}-${hex}`;
}

function buildOrderSnapshot() {
  const items = state.cart.map((line) => {
    const meal = getMeal(line.mealId);
    const unit = getUnitPrice(meal, line.optionIds);
    const options = getSelectedOptions(meal, line.optionIds).map((sel) => ({
      option_group_name: sel.group,
      name: sel.option.label
    }));
    return {
      menu_item_name: meal.name,
      quantity: line.quantity,
      unit_price: unit,
      line_total: unit * line.quantity,
      options
    };
  });
  const total = items.reduce((sum, item) => sum + item.line_total, 0);
  return {
    order_number: generateOrderNumber(),
    status_label: '已建立',
    created_at: new Date().toISOString(),
    total,
    items
  };
}

function createOrderFromCart(idempotencyKey) {
  const availableLines = state.cart.filter((line) => getLineAvailability(line).available);
  if (!state.cart.length || !availableLines.length) {
    showToast('購物車沒有可送單的項目。', true);
    return;
  }
  if (availableLines.length !== state.cart.length) {
    showToast('購物車含有不可用項目，請先移除後再送單。', true);
    return;
  }
  const key = idempotencyKey || `demo-${state.visitorSessionId}-checkout`;
  if (state.idempotencyKeys[key]) {
    const existing = sessionOrders().find((o) => o.order_number === state.idempotencyKeys[key]);
    if (existing) {
      state.lastOrderNumber = existing.order_number;
      state.view = 'order-success';
      render();
      showToast('重複送單：回傳同一筆訂單。');
      return;
    }
  }
  const order = buildOrderSnapshot();
  state.idempotencyKeys[key] = order.order_number;
  sessionOrders().push(order);
  state.cart = [];
  state.lastOrderNumber = order.order_number;
  state.view = 'order-success';
  render();
  showToast(`訂單 ${order.order_number} 已建立，購物車已清空。`);
}

function renderOrderSuccess() {
  const container = document.getElementById('order-success-content');
  if (!container) return;
  const order = sessionOrders().find((o) => o.order_number === state.lastOrderNumber);
  if (!order) {
    container.innerHTML = '<p class="lede">尚無訂單紀錄。</p>';
    return;
  }
  container.innerHTML = `
    <article class="cart-panel">
      <p><strong>訂單編號</strong> ${order.order_number}</p>
      <p><strong>狀態</strong> ${order.status_label}</p>
      <p><strong>總金額（快照）</strong> ${order.total}</p>
      <ul>${order.items.map((item) => `<li>${item.menu_item_name} × ${item.quantity} — ${item.line_total}</li>`).join('')}</ul>
      <button class="button button-primary" type="button" data-view="order-lookup">查詢此訂單</button>
    </article>`;
}

function lookupOrder(number) {
  const result = document.getElementById('order-lookup-result');
  const trimmed = (number || '').trim();
  const order = sessionOrders().find((o) => o.order_number === trimmed);
  if (!order) {
    result.innerHTML = '<p class="alert error">查無訂單或無權限查看。</p>';
    return;
  }
  result.innerHTML = `
    <p><strong>狀態</strong> ${order.status_label}</p>
    <p><strong>總金額（快照）</strong> ${order.total}</p>
    <ul>${order.items.map((item) => `<li>${item.menu_item_name} × ${item.quantity}</li>`).join('')}</ul>`;
}

function renderCategories() {
  const categories = ['全部', ...new Set(state.meals.map((meal) => meal.category))];
  categoryFilters.innerHTML = categories.map((category) => `<button type="button" class="category-button ${category === activeCategory ? 'active' : ''}" data-category="${category}">${category}</button>`).join('');
}

function renderMeals() {
  const meals = state.meals.filter((meal) => activeCategory === '全部' || meal.category === activeCategory);
  menuGrid.innerHTML = meals.map((meal) => `
    <article class="meal-card">
      <div class="meal-photo">
        <img src="${meal.image}" alt="${meal.name}" />
        <span class="meal-state ${meal.available ? '' : 'unavailable'}">${meal.available ? '供應中' : '暫停供應'}</span>
      </div>
      <div class="meal-details">
        <div class="meal-title-row"><h2>${meal.name}</h2><span class="meal-price">${meal.price}</span></div>
        <p class="meal-description">${meal.description}</p>
        <div class="meal-actions"><span class="meal-category">${meal.category}</span><button class="text-action" type="button" data-open-meal="${meal.id}">${meal.available ? '選擇規格　＋' : '查看供應狀態　＋'}</button></div>
      </div>
    </article>
  `).join('');
}

function renderNavigation() {
  const count = state.cart.reduce((sum, line) => sum + line.quantity, 0);
  document.getElementById('cart-count').textContent = count;
  document.getElementById('aside-item-count').textContent = count ? `${count} 份餐點` : '尚未選擇餐點';
  document.getElementById('aside-total').textContent = state.pricingError ? '暫時無法取得' : getCartTotal();
}

function renderCart() {
  cartAlert.className = 'alert hidden';
  cartAlert.textContent = '';
  if (state.sessionExpired) {
    cartAlert.className = 'alert info';
    cartAlert.textContent = '訪客工作階段已更新。這是新的空購物車；先前工作階段的購物車不會顯示或自動合併。';
    state.sessionExpired = false;
  }

  if (state.pricingError) {
    cartAlert.className = 'alert';
    cartAlert.innerHTML = '目前無法取得最新餐點價格，因此暫不顯示金額。<button class="inline-button" type="button" data-action="retry-pricing">重新嘗試</button>';
  }

  if (!state.cart.length) {
    cartContent.innerHTML = `
      <div class="empty-cart">
        <span class="empty-illustration" aria-hidden="true">＋</span>
        <h2>購物車還是空的</h2>
        <p>選幾道喜歡的餐點，稍後可以在這裡調整。</p>
        <button class="button button-primary" type="button" data-view="menu">瀏覽今日菜單 <span aria-hidden="true">→</span></button>
      </div>
      <aside class="cart-summary"><h2>金額摘要</h2><div class="summary-total"><span>目前總額</span><strong>0</strong></div><p class="summary-caveat">金額為流程示意值；正式幣別與精度由服務端提供。</p></aside>`;
    return;
  }

  const lines = state.cart.map((line) => {
    const meal = getMeal(line.mealId);
    if (!meal) return '';
    const availability = getLineAvailability(line);
    const unitPrice = availability.available ? getUnitPrice(meal, line.optionIds) : null;
    const changed = availability.available && line.previousUnitPrice !== null && line.previousUnitPrice !== unitPrice;
    const selected = getSelectedOptions(meal, line.optionIds).map((item) => `${item.group}：${item.option.label}`).join('　·　');
    return `
      <article class="cart-line ${availability.available ? '' : 'cart-line-unavailable'}" data-line-id="${line.id}">
        <img src="${meal.image}" alt="${meal.name}" />
        <div class="line-main">
          <h2>${meal.name}</h2>
          <p class="line-options">${selected}</p>
          ${changed ? `<span class="price-change">價格已更新：${line.previousUnitPrice} → ${unitPrice}</span><br />` : ''}
          ${availability.available ? `<span class="line-price">目前單價 ${state.pricingError ? '暫時無法取得' : unitPrice}</span>` : `<span class="line-unavailable">${availability.reason}；不計入總額。</span>`}
        </div>
        <div class="line-controls">
          <strong class="line-amount">${availability.available ? (state.pricingError ? '暫時無法取得' : unitPrice * line.quantity) : ''}</strong>
          <div class="quantity-control" aria-label="${meal.name}數量">
            <button type="button" aria-label="減少數量" data-quantity="-1" data-line-id="${line.id}" ${availability.available ? '' : 'disabled'}>−</button>
            <input type="number" min="1" step="1" inputmode="numeric" value="${line.quantity}" aria-label="${meal.name}數量" data-quantity-input="${line.id}" ${availability.available ? '' : 'disabled'} />
            <button type="button" aria-label="增加數量" data-quantity="1" data-line-id="${line.id}" ${availability.available ? '' : 'disabled'}>＋</button>
          </div>
          <button class="delete-button" type="button" data-delete-line="${line.id}">刪除餐點</button>
        </div>
      </article>`;
  }).join('');

  const availableQuantity = state.cart.reduce((sum, line) => sum + (getLineAvailability(line).available ? line.quantity : 0), 0);
  const unavailableCount = state.cart.filter((line) => !getLineAvailability(line).available).length;

  cartContent.innerHTML = `
    <section class="cart-lines" aria-label="購物車項目">${lines}</section>
    <aside class="cart-summary">
      <h2>金額摘要</h2>
      <div class="summary-row"><span>可用餐點</span><span>${availableQuantity} 份</span></div>
      ${unavailableCount ? `<div class="summary-row"><span>不可用項目</span><span>${unavailableCount} 項</span></div>` : ''}
      <div class="summary-row"><span>依目前菜單計算</span><span>${state.pricingError ? '暫時無法取得' : '已更新'}</span></div>
      <div class="summary-total"><span>目前總額</span><strong>${state.pricingError ? '暫時無法取得' : getCartTotal()}</strong></div>
      <p class="summary-caveat">此處僅計算餐點與所選規格的示意金額；正式幣別與精度由服務端提供。</p>
      <button class="button button-primary button-wide" type="button" data-action="create-order">確認送單</button>
      <button class="button button-quiet button-wide" type="button" data-action="create-order-idempotent">再次送單（冪等示意）</button>
    </aside>`;
}

function openMeal(mealId) {
  selectedMealId = mealId;
  const meal = getMeal(mealId);
  const groups = meal.groups.map((group) => `
    <fieldset class="option-group" data-option-group="${group.id}">
      <legend>${group.name} <span class="required-label">必選一項</span></legend>
      <div class="option-list">${group.options.map((option) => `
        <label class="option-choice">
          <span><input type="radio" name="option-${group.id}" value="${option.id}" required /><span>${option.label}</span></span>
          <span class="option-extra">${option.extra ? `+ ${option.extra}` : '基本選項'}</span>
        </label>`).join('')}
      </div>
      <p class="group-error hidden">請為此群組選擇一項。</p>
    </fieldset>`).join('');
  dialogContent.innerHTML = `
    <img class="dialog-image" src="${meal.image}" alt="${meal.name}" />
    <div class="dialog-body">
      <div class="dialog-title-row"><h2 id="dialog-title">${meal.name}</h2><strong>${meal.price}</strong></div>
      <p class="dialog-description">${meal.description}　金額為無幣別示意值。</p>
      <p id="option-selection-error" class="form-error hidden" role="alert"></p>
      ${groups}
      <label class="dialog-quantity"><span>數量</span><input id="dialog-quantity" type="number" min="1" step="1" inputmode="numeric" value="1" /></label>
      <button class="button button-primary dialog-submit" type="button" data-action="add-meal">加入購物車 <span id="dialog-total">${meal.price}</span></button>
      ${meal.available ? '' : '<p class="unavailable-note">餐點目前標示為未供應；加入時將再次確認供應狀態。</p>'}
    </div>`;
  dialog.showModal();
  updateDialogPrice();
}

function updateDialogPrice() {
  const meal = getMeal(selectedMealId);
  if (!meal) return;
  const options = Object.fromEntries(meal.groups.map((group) => [group.id, dialog.querySelector(`input[name="option-${group.id}"]:checked`)?.value]));
  document.getElementById('dialog-total').textContent = getUnitPrice(meal, options);
}

function clearOptionError(groupId) {
  const fieldset = dialog.querySelector(`[data-option-group="${groupId}"]`);
  fieldset.classList.remove('invalid');
  fieldset.setAttribute('aria-invalid', 'false');
  fieldset.querySelector('.group-error').classList.add('hidden');
  if (![...dialog.querySelectorAll('[data-option-group]')].some((group) => group.classList.contains('invalid'))) {
    document.getElementById('option-selection-error').classList.add('hidden');
  }
}

function addMeal() {
  const meal = getMeal(selectedMealId);
  if (!meal.available) {
    showToast('餐點目前未供應，未加入購物車。', true);
    return;
  }
  const quantityInput = document.getElementById('dialog-quantity');
  const quantity = Number(quantityInput.value);
  if (!Number.isInteger(quantity) || quantity < 1) {
    quantityInput.setCustomValidity('請輸入正整數數量。');
    quantityInput.reportValidity();
    return;
  }
  const optionIds = Object.fromEntries(meal.groups.map((group) => [group.id, dialog.querySelector(`input[name="option-${group.id}"]:checked`)?.value]));
  const missingGroups = meal.groups.filter((group) => !group.options.some((option) => option.id === optionIds[group.id]));
  if (missingGroups.length) {
    missingGroups.forEach((group) => {
      const fieldset = dialog.querySelector(`[data-option-group="${group.id}"]`);
      fieldset.classList.add('invalid');
      fieldset.setAttribute('aria-invalid', 'true');
      fieldset.querySelector('.group-error').classList.remove('hidden');
    });
    const error = document.getElementById('option-selection-error');
    error.textContent = `請完成以下規格群組：${missingGroups.map((group) => group.name).join('、')}。每個群組必須且只能選一項。`;
    error.classList.remove('hidden');
    dialog.querySelector(`[data-option-group="${missingGroups[0].id}"] input`).focus();
    showToast('仍有規格群組未選擇，未加入購物車。', true);
    return;
  }
  state.cart.push({ id: crypto.randomUUID(), mealId: meal.id, optionIds, quantity, previousUnitPrice: null });
  state.pricingError = false;
  dialog.close();
  render();
  showToast('已加入購物車。金額將依目前菜單資料示意計算。');
}

function updateQuantity(lineId, nextValue, input) {
  const quantity = Number(nextValue);
  if (!Number.isInteger(quantity) || quantity < 1) {
    if (input) input.setCustomValidity('數量須為正整數；移除餐點請使用刪除操作。');
    input?.reportValidity();
    render();
    showToast('數量須為正整數；請使用刪除操作移除餐點。', true);
    return;
  }
  const line = state.cart.find((item) => item.id === lineId);
  if (!line) return;
  if (!getLineAvailability(line).available) {
    showToast('不可用項目不能修改數量，請先刪除。', true);
    render();
    return;
  }
  line.quantity = quantity;
  render();
}

function deleteLine(lineId) {
  state.cart = state.cart.filter((line) => line.id !== lineId);
  render();
  showToast(state.cart.length ? '餐點已從購物車刪除。' : '餐點已刪除，購物車目前沒有項目。');
}

function updatePrices() {
  state.meals = state.meals.map((meal) => meal.id === 'chicken' ? { ...meal, price: meal.price + 15 } : meal);
  state.cart.forEach((line) => {
    if (line.mealId === 'chicken') line.previousUnitPrice = getMeal(line.mealId).price - 15 + getSelectedOptions(getMeal(line.mealId), line.optionIds).reduce((sum, selection) => sum + selection.option.extra, 0);
  });
  render();
  showToast('菜單價格已更新；購物車已依目前價格重新計算。');
}

function invalidateFirstCartMeal() {
  const line = state.cart[0];
  const meal = line && getMeal(line.mealId);
  if (!meal) {
    showToast('請先將餐點加入購物車。', true);
    return;
  }
  meal.available = false;
  state.view = 'cart';
  render();
  showToast('示範餐點停供：項目已保留且不計入總額。');
}

function invalidateFirstCartOption() {
  const line = state.cart[0];
  const meal = line && getMeal(line.mealId);
  const selection = meal && meal.groups
    .map((group) => ({ group, option: group.options.find((entry) => entry.id === line.optionIds[group.id]) }))
    .find((entry) => entry.option);
  if (!selection) {
    showToast('請先加入具有規格選項的餐點。', true);
    return;
  }
  selection.option.available = false;
  state.view = 'cart';
  render();
  showToast('示範規格失效：項目已保留且不計入總額。');
}

function restoreAvailability() {
  state.meals = state.meals.map((meal) => {
    const initialMeal = initialMeals.find((item) => item.id === meal.id);
    return {
      ...meal,
      available: initialMeal?.available ?? meal.available,
      groups: meal.groups.map((group) => ({
        ...group,
        options: group.options.map((option) => ({ ...option, available: true }))
      }))
    };
  });
  render();
  showToast('已恢復餐點與規格供應狀態。');
}

function showToast(message, isError = false, duration = 3400) {
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : ''}`;
  toast.textContent = message;
  document.getElementById('toast-stack').append(toast);
  window.setTimeout(() => toast.remove(), duration);
}

function switchVisitorSession() {
  state.cartsBySession[state.visitorSessionId] = state.cart;
  state.ordersBySession[state.visitorSessionId] = sessionOrders();
  state.visitorSessionId = state.visitorSessionId === 'visitor-a' ? 'visitor-b' : 'visitor-a';
  state.cart = [...(state.cartsBySession[state.visitorSessionId] ?? [])];
  state.pricingError = false;
  state.sessionExpired = false;
  render();
  showToast('已切換訪客工作階段；目前只顯示該工作階段的購物車。');
}

function expireVisitorSession() {
  state.cartsBySession[state.visitorSessionId] = state.cart;
  state.visitorSessionId = `fresh-${crypto.randomUUID()}`;
  state.cart = [];
  state.pricingError = false;
  state.sessionExpired = true;
  state.view = 'cart';
  render();
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('button');
  if (!target) return;
  if (target.dataset.view) {
    state.view = target.dataset.view;
    render();
  }
  if (target.dataset.category) {
    activeCategory = target.dataset.category;
    renderCategories();
    renderMeals();
  }
  if (target.dataset.openMeal) openMeal(target.dataset.openMeal);
  if (target.dataset.action === 'add-meal') addMeal();
  if (target.dataset.action === 'retry-pricing') {
    state.pricingError = false;
    render();
    showToast('已重新取得目前菜單價格。');
  }
  if (target.dataset.quantity) {
    const line = state.cart.find((item) => item.id === target.dataset.lineId);
    if (line) updateQuantity(line.id, line.quantity + Number(target.dataset.quantity));
  }
  if (target.dataset.deleteLine) deleteLine(target.dataset.deleteLine);
  if (target.dataset.action === 'create-order') createOrderFromCart();
  if (target.dataset.action === 'create-order-idempotent') createOrderFromCart('demo-idempotent-key');
  if (target.dataset.action === 'lookup-order') {
    const input = document.getElementById('order-lookup-input');
    lookupOrder(input?.value || state.lastOrderNumber || '');
    if (state.lastOrderNumber && input && !input.value) input.value = state.lastOrderNumber;
  }
  if (target.dataset.demo === 'switch-session') switchVisitorSession();
  if (target.dataset.demo === 'expire-session') expireVisitorSession();
  if (target.dataset.demo === 'price-update') updatePrices();
  if (target.dataset.demo === 'unavailable-meal') invalidateFirstCartMeal();
  if (target.dataset.demo === 'unavailable-option') invalidateFirstCartOption();
  if (target.dataset.demo === 'restore-availability') restoreAvailability();
  if (target.dataset.demo === 'pricing-error') {
    state.pricingError = true;
    state.view = 'cart';
    render();
  }
  if (target.dataset.demo === 'reset') {
    state = structuredClone(defaults);
    activeCategory = '全部';
    render();
    showToast('示範資料已重設。');
  }
});

document.addEventListener('change', (event) => {
  const target = event.target;
  if (target.matches('.option-group input[type="radio"]')) {
    clearOptionError(target.closest('[data-option-group]').dataset.optionGroup);
    updateDialogPrice();
  }
  if (target.matches('[data-quantity-input]')) updateQuantity(target.dataset.quantityInput, target.value, target);
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'dialog-quantity') event.target.setCustomValidity('');
  if (event.target.matches('[data-quantity-input]')) event.target.setCustomValidity('');
});

render();