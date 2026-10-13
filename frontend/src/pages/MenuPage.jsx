import { useEffect, useMemo, useRef, useState } from 'react';
import { cartApi } from '../cartApi.js';
import { buildAddToCartPayload, loadMenuData } from '../menuApi.js';
import MealOptionsDialog from '../components/MealOptionsDialog.jsx';
import CartPage from './CartPage.jsx';

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
  const [activeView, setActiveView] = useState('menu');
  const [cart, setCart] = useState({ items: [], total: '0.00' });
  const [cartError, setCartError] = useState('');
  const [cartBusy, setCartBusy] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    cartApi.getCart().then((response) => {
      if (mountedRef.current) {
        setCart(response.cart);
      }
    }).catch(() => {
      if (mountedRef.current) {
        setCartError('購物車載入失敗，請重新整理後再試。');
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
        setCartError(error.code === 'CART_ITEM_UNAVAILABLE'
          ? '此餐點或規格已停止供應，請移除後重新選擇。'
          : '購物車操作失敗，請稍後再試。');
      }
      return false;
    } finally {
      if (mountedRef.current) {
        setCartBusy(false);
      }
    }
  };

  const openOptions = (item) => {
    if (!item.is_active) {
      return;
    }

    setSelectedItem(item);
    setSelectedOptions({});

    if (!item.option_groups?.length) {
      const result = buildAddToCartPayload(item, {});
      if (result.error) {
        return;
      }
      runCartAction(() => cartApi.addItem(result.payload)).then((added) => {
        if (added) {
          setActiveView('cart');
        }
      });
      setSelectedItem(null);
    }
  };

  const addSelectedItem = (payload) => {
    runCartAction(() => cartApi.addItem(payload)).then((added) => {
      if (added) {
        setSelectedItem(null);
        setActiveView('cart');
      }
    });
  };

  const updateQuantity = (item, quantity) => {
    runCartAction(() => cartApi.updateItem(item.id, quantity));
  };

  const deleteItem = (item) => {
    runCartAction(() => cartApi.deleteItem(item.id));
  };

  return (
    <main className="menu-page">
      <header className="menu-page__header">
        <h1>餐點瀏覽</h1>
        <nav className="view-switch" aria-label="主要檢視">
          <button type="button" className={activeView === 'menu' ? 'selected' : ''} onClick={() => setActiveView('menu')}>
            菜單
          </button>
          <button type="button" className={activeView === 'cart' ? 'selected' : ''} onClick={() => setActiveView('cart')}>
            購物車 <span className="cart-count">{cart.items.length}</span>
          </button>
        </nav>
      </header>

      {activeView === 'menu' ? (
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
            <section className="menu-grid" aria-label="餐點列表">
              {visibleItems.map((item) => (
                <article key={item.id} className="menu-card">
                  <div className="menu-card__image-wrap">
                    {item.image_url && !brokenImages[item.id] ? (
                      <img
                        src={item.image_url}
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
                      <span className="menu-card__tag">{item.category_name || '暫無分類'}</span>
                    </div>
                    <p className="menu-card__price">{item.price !== undefined && item.price !== null ? `NT$ ${item.price}` : '暫無價格'}</p>
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
              ))}
            </section>
          )}
        </>
      ) : (
        <CartPage
          cart={cart}
          cartError={cartError}
          cartBusy={cartBusy}
          onUpdateQuantity={updateQuantity}
          onDeleteItem={deleteItem}
        />
      )}

      {selectedItem && (
        <MealOptionsDialog
          item={selectedItem}
          selectedOptions={selectedOptions}
          onChangeOption={(groupId, optionId) => setSelectedOptions((previous) => ({ ...previous, [groupId]: optionId }))}
          onClose={() => setSelectedItem(null)}
          onSubmit={addSelectedItem}
          busy={cartBusy}
        />
      )}
    </main>
  );
}
