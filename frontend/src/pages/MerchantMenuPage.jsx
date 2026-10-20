import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { loadPublicMenuItems } from '../menuApi.js';
import { createMerchantMenuApi } from '../merchantMenuApi.js';

function emptyItemDraft() {
  return {
    name: '',
    price: '',
    category_id: '',
    image_url: '',
    is_active: true,
    option_groups: [],
  };
}

function itemToDraft(item) {
  return {
    name: item.name ?? '',
    price: item.price ?? '',
    category_id: item.category_id ?? '',
    image_url: item.image_url ?? '',
    is_active: item.is_active !== false,
    option_groups: (item.option_groups ?? []).map((group) => ({
      id: group.id,
      name: group.name ?? '',
      is_required: group.is_required !== false,
      options: (group.options ?? []).map((option) => ({
        id: option.id,
        name: option.name ?? '',
        price_adjustment: option.price_adjustment ?? '0.00',
        is_active: option.is_active !== false,
      })),
    })),
  };
}

export default function MerchantMenuPage({ merchantToken, onMenuChanged }) {
  const api = useMemo(() => createMerchantMenuApi(fetch, { merchantToken }), [merchantToken]);
  const onMenuChangedRef = useRef(onMenuChanged);
  onMenuChangedRef.current = onMenuChanged;
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [itemDraft, setItemDraft] = useState(emptyItemDraft);
  const [editingItemId, setEditingItemId] = useState(null);
  const [itemFormOpen, setItemFormOpen] = useState(false);

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
      return true;
    } catch (err) {
      setError(err.message || '操作失敗。');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const startNewItem = () => {
    setEditingItemId(null);
    setItemDraft({ ...emptyItemDraft(), category_id: categories[0]?.id ?? '' });
    setItemFormOpen(true);
  };

  const startEditItem = (item) => {
    setEditingItemId(item.id);
    setItemDraft(itemToDraft(item));
    setItemFormOpen(true);
  };

  const updateGroup = (groupIndex, changes) => {
    setItemDraft((draft) => ({
      ...draft,
      option_groups: draft.option_groups.map((group, index) =>
        index === groupIndex ? { ...group, ...changes } : group
      ),
    }));
  };

  const updateOption = (groupIndex, optionIndex, changes) => {
    setItemDraft((draft) => ({
      ...draft,
      option_groups: draft.option_groups.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              options: group.options.map((option, currentIndex) =>
                currentIndex === optionIndex ? { ...option, ...changes } : option
              ),
            }
          : group
      ),
    }));
  };

  const saveItem = async (event) => {
    event.preventDefault();
    const payload = {
      ...itemDraft,
      name: itemDraft.name.trim(),
      image_url: itemDraft.image_url.trim() || null,
      option_groups: itemDraft.option_groups.map((group) => ({
        ...group,
        name: group.name.trim(),
        options: group.options.map((option) => ({
          ...option,
          name: option.name.trim(),
          price_adjustment: option.price_adjustment || '0.00',
        })),
      })),
    };
    const succeeded = await run(() =>
      editingItemId
        ? api.updateMenuItem(editingItemId, payload)
        : api.createMenuItem(payload)
    );
    if (succeeded) {
      setItemFormOpen(false);
      setEditingItemId(null);
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

      <div className="merchant-menu__item-toolbar">
        <h3>餐點</h3>
        <button type="button" disabled={busy || categories.length === 0} onClick={startNewItem}>
          新增餐點
        </button>
      </div>
      {categories.length === 0 && <p className="merchant-menu__hint">請先建立分類，再新增餐點。</p>}

      {itemFormOpen && (
        <form className="merchant-menu__item-form" onSubmit={saveItem}>
          <div className="merchant-menu__form-heading">
            <h3>{editingItemId ? '編輯餐點' : '新增餐點'}</h3>
            <button
              type="button"
              className="text-button"
              disabled={busy}
              onClick={() => setItemFormOpen(false)}
            >
              取消
            </button>
          </div>
          <div className="merchant-menu__fields">
            <label>
              餐點名稱
              <input
                required
                value={itemDraft.name}
                disabled={busy}
                onChange={(event) => setItemDraft({ ...itemDraft, name: event.target.value })}
              />
            </label>
            <label>
              價格
              <input
                required
                inputMode="decimal"
                pattern="[0-9]+([.][0-9]{1,2})?"
                value={itemDraft.price}
                disabled={busy}
                onChange={(event) => setItemDraft({ ...itemDraft, price: event.target.value })}
              />
            </label>
            <label>
              分類
              <select
                required
                value={itemDraft.category_id}
                disabled={busy}
                onChange={(event) => setItemDraft({ ...itemDraft, category_id: event.target.value })}
              >
                <option value="" disabled>選擇分類</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label>
              圖片網址
              <input
                type="url"
                value={itemDraft.image_url}
                disabled={busy}
                onChange={(event) => setItemDraft({ ...itemDraft, image_url: event.target.value })}
              />
            </label>
            <label className="merchant-menu__check">
              <input
                type="checkbox"
                checked={itemDraft.is_active}
                disabled={busy}
                onChange={(event) => setItemDraft({ ...itemDraft, is_active: event.target.checked })}
              />
              供應中
            </label>
          </div>

          <div className="merchant-menu__groups-heading">
            <h4>規格群組</h4>
            <button
              type="button"
              disabled={busy}
              onClick={() => setItemDraft((draft) => ({
                ...draft,
                option_groups: [...draft.option_groups, { name: '', is_required: true, options: [] }],
              }))}
            >
              新增群組
            </button>
          </div>
          {itemDraft.option_groups.map((group, groupIndex) => (
            <fieldset className="merchant-menu__group" key={group.id ?? groupIndex}>
              <legend>群組 {groupIndex + 1}</legend>
              <div className="merchant-menu__group-heading">
                <label>
                  群組名稱
                  <input
                    required
                    value={group.name}
                    disabled={busy}
                    onChange={(event) => updateGroup(groupIndex, { name: event.target.value })}
                  />
                </label>
                <label className="merchant-menu__check">
                  <input
                    type="checkbox"
                    checked={group.is_required}
                    disabled={busy}
                    onChange={(event) => updateGroup(groupIndex, { is_required: event.target.checked })}
                  />
                  必選
                </label>
                <button
                  type="button"
                  className="text-button"
                  disabled={busy}
                  onClick={() => setItemDraft((draft) => ({
                    ...draft,
                    option_groups: draft.option_groups.filter((_, index) => index !== groupIndex),
                  }))}
                >
                  移除群組
                </button>
              </div>
              {group.options.map((option, optionIndex) => (
                <div className="merchant-menu__option" key={option.id ?? optionIndex}>
                  <label>
                    選項名稱
                    <input
                      required
                      value={option.name}
                      disabled={busy}
                      onChange={(event) => updateOption(groupIndex, optionIndex, { name: event.target.value })}
                    />
                  </label>
                  <label>
                    加價
                    <input
                      inputMode="decimal"
                      pattern="[0-9]+([.][0-9]{1,2})?"
                      value={option.price_adjustment}
                      disabled={busy}
                      onChange={(event) => updateOption(groupIndex, optionIndex, { price_adjustment: event.target.value })}
                    />
                  </label>
                  <label className="merchant-menu__check">
                    <input
                      type="checkbox"
                      checked={option.is_active}
                      disabled={busy}
                      onChange={(event) => updateOption(groupIndex, optionIndex, { is_active: event.target.checked })}
                    />
                    供應中
                  </label>
                  <button
                    type="button"
                    className="text-button"
                    disabled={busy}
                    onClick={() => updateGroup(groupIndex, {
                      options: group.options.filter((_, index) => index !== optionIndex),
                    })}
                  >
                    移除
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="text-button"
                disabled={busy}
                onClick={() => updateGroup(groupIndex, {
                  options: [...group.options, { name: '', price_adjustment: '0.00', is_active: true }],
                })}
              >
                新增選項
              </button>
            </fieldset>
          ))}
          <button type="submit" className="action-button" disabled={busy || categories.length === 0}>
            {busy ? '儲存中…' : '儲存餐點'}
          </button>
        </form>
      )}

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
              onClick={() => startEditItem(item)}
            >
              編輯
            </button>
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
