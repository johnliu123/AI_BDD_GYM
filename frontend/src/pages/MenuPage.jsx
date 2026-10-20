import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cartApi } from '../cartApi.js';
import { orderApi } from '../orderApi.js';
import { buildAddToCartPayload, loadMenuData, menuItemDisplayFields } from '../menuApi.js';
import MealOptionsDialog from '../components/MealOptionsDialog.jsx';
import CartPage from './CartPage.jsx';
import OrderLookupPage from './OrderLookupPage.jsx';
import MerchantOrdersPage from './MerchantOrdersPage.jsx';
import MerchantMenuPage from './MerchantMenuPage.jsx';
import OrderPaymentActions from '../components/OrderPaymentActions.jsx';
import { paymentActionErrorMessage } from '../orderPaymentUi.js';
import { resolveMerchantToken } from '../merchantOrderApi.js';

const emptyState = {
  hasData: false,
  message: '目前沒有可顯示的餐點資料。',
};

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [brokenImages, setBrokenImages] = useState({});
  const merchantToken = resolveMerchantToken();

  const resolveViewFromHash = () => {
    const hash = globalThis.location?.hash || '';
    if (hash.startsWith('#/merchant/menu')) {
      return 'merchant-menu';
    }
    if (hash.startsWith('#/merchant')) {
      return 'merchant';
    }
    if (hash === '#/cart') {
      return 'cart';
    }
    if (hash === '#/lookup') {
      return 'lookup';
    }
    return 'menu';
  };

  const [activeView, setActiveView] = useState(resolveViewFromHash);
  const [cart, setCart] = useState({ items: [], total: '0.00' });
  const [cartError, setCartError] = useState('');
  const [cartBusy, setCartBusy] = useState(false);
  const [orderBusy, setOrderBusy] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderResult, setOrderResult] = useState(null);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [simulatePayFailure, setSimulatePayFailure] = useState(false);
  const [paymentToast, setPaymentToast] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const mountedRef = useRef(true);
  const paymentToastTimerRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (paymentToastTimerRef.current) {
        clearTimeout(paymentToastTimerRef.current);
        paymentToastTimerRef.current = null;
      }
    };
  }, []);

  const handleMerchantMenuChanged = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  const showPaymentToast = useCallback((message) => {
    if (paymentToastTimerRef.current) {
      clearTimeout(paymentToastTimerRef.current);
    }
    if (!mountedRef.current) {
      return;
    }
    setPaymentToast(message);
    paymentToastTimerRef.current = setTimeout(() => {
      paymentToastTimerRef.current = null;
      if (mountedRef.current) {
        setPaymentToast('');
      }
    }, 2200);
  }, []);

  useEffect(() => {
    const syncHash = () => {
      setActiveView(resolveViewFromHash());
    };
    globalThis.addEventListener('hashchange', syncHash);
    return () => globalThis.removeEventListener('hashchange', syncHash);
  }, []);

  const navigateTo = (view) => {
    if (view === 'merchant-menu') {
      globalThis.location.hash = '#/merchant/menu';
      setActiveView('merchant-menu');
      return;
    }
    if (view === 'merchant') {
      globalThis.location.hash = '#/merchant';
      setActiveView('merchant');
      return;
    }
    if (view === 'cart' || view === 'lookup') {
      globalThis.location.hash = `#/${view}`;
      setActiveView(view);
      return;
    }
    if (view === 'menu') {
      globalThis.location.hash = '';
    }
    setActiveView(view);
  };

  useEffect(() => {
    cartApi.getCart().then((response) => {
      if (mountedRef.current) {
        setCart(response.cart);
      }
    }).catch((error) => {
      if (mountedRef.current) {
        setCartError(error.message || '購物車載入失敗，請重新整理後再試。');
      }
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      setLoading(true);
      setLoadError(false);

      try {
        const data = await loadMenuData(fetch, { signal: controller.signal });
        if (controller.signal.aborted) {
          return;
        }

        setCategories(data.categories);
        setItems(data.items);
      } catch {
        if (controller.signal.aborted) {
          return;
        }

        setCategories([]);
        setItems([]);
        setLoadError(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => controller.abort();
  }, [reloadKey]);

  const visibleItems = useMemo(() => {
    if (selectedCategory === 'all') {
      return items;
    }

    return items.filter((item) => item.category_name === selectedCategory);
  }, [items, selectedCategory]);

  const viewState = visibleItems.length === 0 ? emptyState : { hasData: true };

  const handleImageError = (itemId) => {
    setBrokenImages((previous) => ({ ...previous, [itemId]: true }));
  };

  const cartActionErrorMessage = (error) => {
    if (error.code === 'CART_ITEM_UNAVAILABLE') {
      return '此餐點或規格已停止供應，請移除後重新選擇。';
    }
    if (error.code === 'INVALID_CSRF_TOKEN') {
      return '工作階段已過期，請重新整理頁面後再試。';
    }
    if (error.code === 'INVALID_ORIGIN') {
      return '請使用 http://localhost:5173 或 http://127.0.0.1:5173 開啟本站。';
    }
    if (error.code === 'CART_SESSION_NOT_INITIALIZED') {
      return error.message || '購物車尚未就緒，請重新整理頁面後再試。';
    }
    if (error.message && error.message !== 'CART_REQUEST_FAILED') {
      return error.message;
    }
    return '購物車操作失敗，請稍後再試。';
  };

  const runCartAction = async (action) => {
    if (!mountedRef.current) {
      return false;
    }
    setCartBusy(true);
    setCartError('');
    try {
      const response = await action();
      if (!mountedRef.current) {
        return false;
      }
      setCart(response.cart);
      return true;
    } catch (error) {
      if (mountedRef.current) {
        setCartError(cartActionErrorMessage(error));
      }
      return false;
    } finally {
      if (mountedRef.current) {
        setCartBusy(false);
      }
    }
  };

  const openOptions = async (item) => {
    if (!item.is_active) {
      return;
    }

    if (!item.option_groups?.length) {
      const result = buildAddToCartPayload(item, {});
      if (result.error) {
        return;
      }
      try {
        await cartApi.getCart();
      } catch {
        setCartError('購物車載入失敗，請重新整理後再試。');
        return;
      }
      const added = await runCartAction(() => cartApi.addItem(result.payload));
      if (added) {
        navigateTo('cart');
      }
      return;
    }

    setSelectedItem(item);
    setSelectedOptions({});
  };

  const addSelectedItem = (payload) => {
    runCartAction(() => cartApi.addItem(payload)).then((added) => {
      if (added) {
        setSelectedItem(null);
        navigateTo('cart');
      }
    });
  };

  const updateQuantity = (item, quantity) => {
    runCartAction(() => cartApi.updateItem(item.id, quantity));
  };

  const deleteItem = (item) => {
    runCartAction(() => cartApi.deleteItem(item.id));
  };

  const submitOrder = async () => {
    setOrderBusy(true);
    setOrderError('');
    const idempotencyKey = globalThis.crypto.randomUUID();
    try {
      const response = await orderApi.createOrder({ body: {}, idempotencyKey });
      setOrderResult(response.order);
      setLookupResult(null);
      setLookupError('');
      const cartResponse = await orderApi.cartApi.getCart();
      if (mountedRef.current) {
        setCart(cartResponse.cart);
        navigateTo('order');
      }
    } catch (error) {
      if (mountedRef.current) {
        if (error.code === 'CART_HAS_UNAVAILABLE_ITEMS') {
          setOrderError('購物車含有不可用項目，請先移除後再送單。');
        } else if (error.code === 'CART_EMPTY') {
          setOrderError('購物車沒有可送單的項目。');
        } else {
          setOrderError('送單失敗，請稍後再試。');
        }
      }
    } finally {
      if (mountedRef.current) {
        setOrderBusy(false);
      }
    }
  };

  const syncOrderViews = (order) => {
    if (orderResult?.order_number === order.order_number) {
      setOrderResult(order);
    }
    if (lookupResult?.order_number === order.order_number) {
      setLookupResult(order);
    }
  };

  const payForOrder = async (orderNumber) => {
    setPaymentBusy(true);
    setPaymentError('');
    try {
      const body =
        import.meta.env.DEV && simulatePayFailure ? { simulate_outcome: 'failure' } : {};
      const response = await orderApi.payOrder(orderNumber, { body });
      syncOrderViews(response.order);
    } catch (error) {
      if (mountedRef.current) {
        const message = paymentActionErrorMessage(error);
        setPaymentError(message);
        showPaymentToast(message);
      }
    } finally {
      if (mountedRef.current) {
        setPaymentBusy(false);
      }
    }
  };

  const cancelForOrder = async (orderNumber) => {
    setPaymentBusy(true);
    setPaymentError('');
    try {
      const response = await orderApi.cancelOrder(orderNumber);
      syncOrderViews(response.order);
    } catch (error) {
      if (mountedRef.current) {
        const message = paymentActionErrorMessage(error);
        setPaymentError(message);
        showPaymentToast(message);
      }
    } finally {
      if (mountedRef.current) {
        setPaymentBusy(false);
      }
    }
  };

  const lookupOrder = async (orderNumber) => {
    setLookupBusy(true);
    setLookupError('');
    setLookupResult(null);
    try {
      const response = await orderApi.getOrder(orderNumber);
      if (mountedRef.current) {
        setLookupResult(response.order);
      }
    } catch (error) {
      if (mountedRef.current) {
        setLookupError(error.code === 'ORDER_NOT_FOUND' ? '找不到訂單。' : '查詢失敗，請稍後再試。');
      }
    } finally {
      if (mountedRef.current) {
        setLookupBusy(false);
      }
    }
  };

  return (
    <main className="menu-page">
      <header className="menu-page__header">
        <h1>餐點瀏覽</h1>
        <nav className="view-switch" aria-label="主要檢視">
          <button type="button" className={activeView === 'menu' ? 'selected' : ''} onClick={() => navigateTo('menu')}>
            菜單
          </button>
          <button type="button" className={activeView === 'cart' ? 'selected' : ''} onClick={() => navigateTo('cart')}>
            購物車 <span className="cart-count">{cart.items.length}</span>
          </button>
          <button type="button" className={activeView === 'lookup' ? 'selected' : ''} onClick={() => navigateTo('lookup')}>
            查詢訂單
          </button>
          <button
            type="button"
            className={activeView === 'merchant' || activeView === 'merchant-menu' ? 'selected' : ''}
            onClick={() => navigateTo('merchant')}
          >
            店家看板
          </button>
        </nav>
      </header>

      {activeView === 'merchant' || activeView === 'merchant-menu' ? (
        <>
          <nav className="view-switch merchant-subnav" aria-label="店家功能">
            <button
              type="button"
              className={activeView === 'merchant' ? 'selected' : ''}
              onClick={() => navigateTo('merchant')}
            >
              訂單
            </button>
            <button
              type="button"
              className={activeView === 'merchant-menu' ? 'selected' : ''}
              onClick={() => navigateTo('merchant-menu')}
            >
              菜單
            </button>
          </nav>
          {activeView === 'merchant-menu' ? (
            <MerchantMenuPage merchantToken={merchantToken} onMenuChanged={handleMerchantMenuChanged} />
          ) : (
            <MerchantOrdersPage merchantToken={merchantToken} />
          )}
        </>
      ) : activeView === 'menu' ? (
        <>
          <section className="menu-page__filters" aria-label="分類篩選">
            <button
              type="button"
              className={selectedCategory === 'all' ? 'selected' : ''}
              onClick={() => setSelectedCategory('all')}
            >
              全部
            </button>
            {categories
              .slice()
              .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
              .map((category) => (
                <button
                  type="button"
                  key={category.id}
                  className={selectedCategory === category.name ? 'selected' : ''}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  {category.name}
                </button>
              ))}
          </section>

          {loading ? (
            <p className="menu-page__empty">載入中...</p>
          ) : loadError ? (
            <div className="menu-page__empty" role="alert">
              <p>餐點資料載入失敗，請稍後再試。</p>
              <button
                type="button"
                className="menu-page__retry"
                onClick={() => setReloadKey((previous) => previous + 1)}
              >
                重新載入
              </button>
            </div>
          ) : !viewState.hasData ? (
            <div className="menu-page__empty">{viewState.message}</div>
          ) : (
            <>
            {cartError && (
              <p className="cart-error" role="alert">
                {cartError}
              </p>
            )}
            <section className="menu-grid" aria-label="餐點列表">
              {visibleItems.map((item) => {
                const display = menuItemDisplayFields(item);
                return (
                <article key={item.id} className="menu-card">
                  <div className="menu-card__image-wrap">
                    {display.imageUrl && !brokenImages[item.id] ? (
                      <img
                        src={display.imageUrl}
                        alt={item.name}
                        className="menu-card__image"
                        onError={() => handleImageError(item.id)}
                      />
                    ) : (
                      <div className="menu-card__placeholder">暫無圖片</div>
                    )}
                  </div>

                  <div className="menu-card__content">
                    <div className="menu-card__header">
                      <h3>{item.name}</h3>
                      <span className="menu-card__tag">{display.categoryLabel}</span>
                      {!item.is_active && <span className="menu-card__sold-out">售完</span>}
                    </div>
                    <p className="menu-card__price">{display.priceLabel}</p>
                    <button
                      type="button"
                      className="action-button"
                      disabled={!item.is_active || cartBusy}
                      onClick={() => openOptions(item)}
                    >
                      {item.is_active ? '選擇規格並加入' : '暫停供應'}
                    </button>
                  </div>
                </article>
                );
              })}
            </section>
            </>
          )}
        </>
      ) : activeView === 'cart' ? (
        <CartPage
          cart={cart}
          cartError={cartError}
          cartBusy={cartBusy}
          orderBusy={orderBusy}
          orderError={orderError}
          onUpdateQuantity={updateQuantity}
          onDeleteItem={deleteItem}
          onSubmitOrder={submitOrder}
        />
      ) : activeView === 'order' && orderResult ? (
        <section className="order-result" aria-label="訂單建立成功">
          <h2>訂單已建立</h2>
          <p>訂單編號：<strong>{orderResult.order_number}</strong></p>
          <p>出餐狀態：{orderResult.status_label}</p>
          <p>總金額：NT$ {orderResult.total}</p>
          <OrderPaymentActions
            order={orderResult}
            busy={paymentBusy || orderBusy}
            actionError={paymentError}
            onPay={() => payForOrder(orderResult.order_number)}
            onCancel={() => cancelForOrder(orderResult.order_number)}
            simulateFailure={simulatePayFailure}
            onSimulateFailureChange={setSimulatePayFailure}
          />
          <ul>
            {orderResult.items.map((item) => (
              <li key={`${item.menu_item_id}-${item.menu_item_name}`}>
                {item.menu_item_name} × {item.quantity} — NT$ {item.line_total}
              </li>
            ))}
          </ul>
          <button type="button" className="action-button" onClick={() => navigateTo('lookup')}>
            查詢此訂單
          </button>
        </section>
      ) : (
        <OrderLookupPage
          lookupBusy={lookupBusy}
          lookupError={lookupError}
          lookupResult={lookupResult}
          onLookup={lookupOrder}
          onRefresh={lookupOrder}
          paymentBusy={paymentBusy}
          paymentError={paymentError}
          onPay={payForOrder}
          onCancel={cancelForOrder}
          simulatePayFailure={simulatePayFailure}
          onSimulatePayFailureChange={setSimulatePayFailure}
        />
      )}

      {paymentToast && (
        <p className="menu-page__payment-toast" role="status">
          {paymentToast}
        </p>
      )}

      {selectedItem && (
        <MealOptionsDialog
          item={selectedItem}
          selectedOptions={selectedOptions}
          onChangeOption={(groupId, optionId) => setSelectedOptions((previous) => ({ ...previous, [groupId]: optionId }))}
          onClose={() => {
            setSelectedItem(null);
            setCartError('');
          }}
          onSubmit={addSelectedItem}
          busy={cartBusy}
          error={cartError}
        />
      )}
    </main>
  );
}
