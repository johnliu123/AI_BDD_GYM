import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { loadPublicMenuItems } from '../menuApi.js';
import { createMerchantMenuApi } from '../merchantMenuApi.js';

export default function MerchantMenuPage({ merchantToken, onMenuChanged }) {
  const api = useMemo(() => createMerchantMenuApi(fetch, { merchantToken }), [merchantToken]);
  const onMenuChangedRef = useRef(onMenuChanged);
  onMenuChangedRef.current = onMenuChanged;
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const reload = useCallback(async () => {
    setError('');
    try {
      const [catRes, menuRes] = await Promise.all([
        api.listCategories(),
        loadPublicMenuItems(fetch),
      ]);
      setCategories(catRes.categories);
      setItems(menuRes.items ?? []);
      onMenuChangedRef.current?.();
    } catch (err) {
      setError(err.message || '載入菜單失敗。');
    }
  }, [api]);

  useEffect(() => {
    reload();
  }, [reload]);

  const run = async (action) => {
    setBusy(true);
    setError('');
    try {
      await action();
      await reload();
    } catch (err) {
      setError(err.message || '操作失敗。');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="merchant-menu" aria-label="店家菜單維護">
      <h2>菜單維護</h2>
      {error && <p className="cart-error" role="alert">{error}</p>}

      <form
        className="merchant-menu__form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!newCategoryName.trim()) {
            return;
          }
          run(() => api.createCategory({ name: newCategoryName.trim() })).then(() => setNewCategoryName(''));
        }}
      >
        <label>
          新分類名稱
          <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} disabled={busy} />
        </label>
        <button type="submit" disabled={busy}>建立分類</button>
      </form>

      <ul className="merchant-menu__categories">
        {categories.map((category) => (
          <li key={category.id}>
            <span>{category.name}</span>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                const name = globalThis.prompt('更新分類名稱', category.name);
                if (name?.trim()) {
                  run(() => api.updateCategory(category.id, { name: name.trim() }));
                }
              }}
            >
              重新命名
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => api.deleteCategory(category.id))}
            >
              刪除
            </button>
          </li>
        ))}
      </ul>

      <div className="merchant-menu__items">
        {items.map((item) => (
          <article key={item.id} className="merchant-menu__item">
            <h3>{item.name}</h3>
            <p>
              NT$ {item.price} · {item.is_active ? '供應中' : '售完'}
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => api.patchItemAvailability(item.id, !item.is_active))}
            >
              {item.is_active ? '標記售完' : '恢復供應'}
            </button>
            {item.option_groups?.flatMap((group) =>
              group.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="text-button"
                  disabled={busy}
                  onClick={() => run(() => api.patchOptionAvailability(item.id, option.id, !option.is_active))}
                >
                  {option.name}：{option.is_active ? '停供' : '恢復'}
                </button>
              ))
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
