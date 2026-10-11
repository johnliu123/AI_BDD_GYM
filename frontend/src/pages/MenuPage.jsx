import { useEffect, useMemo, useState } from 'react';
import { loadMenuData } from '../menuApi.js';

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

  return (
    <main className="menu-page">
      <header className="menu-page__header">
        <h1>餐點瀏覽</h1>
        <p>選擇分類後查看餐點名稱、圖片、價格與類別</p>
      </header>

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
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
