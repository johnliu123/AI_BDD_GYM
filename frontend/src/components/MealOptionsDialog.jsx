import { buildAddToCartPayload, isOptionSelectionComplete } from '../menuApi.js';

export default function MealOptionsDialog({
  item,
  selectedOptions,
  onChangeOption,
  onClose,
  onSubmit,
  busy,
  error,
}) {
  if (!item?.option_groups?.length) {
    return null;
  }

  const complete = isOptionSelectionComplete(item.option_groups, selectedOptions);

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = buildAddToCartPayload(item, selectedOptions);
    if (result.error) {
      return;
    }
    onSubmit(result.payload);
  };

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <form className="options-dialog" role="dialog" aria-modal="true" aria-labelledby="options-title" onSubmit={handleSubmit}>
        <div className="options-dialog__heading">
          <div>
            <p>選擇餐點規格</p>
            <h2 id="options-title">{item.name}</h2>
          </div>
          <button type="button" className="icon-button" aria-label="關閉" onClick={onClose}>×</button>
        </div>
        {item.option_groups.map((group) => (
          <fieldset className="option-group" key={group.id}>
            <legend>{group.name}</legend>
            {group.options.filter((option) => option.is_active).map((option) => (
              <label className="option-choice" key={option.id}>
                <span>
                  <input
                    type="radio"
                    name={group.id}
                    value={option.id}
                    checked={selectedOptions[group.id] === option.id}
                    onChange={() => onChangeOption(group.id, option.id)}
                  />
                  {option.name}
                </span>
                <span>{option.price_adjustment !== '0.00' ? `+ NT$ ${option.price_adjustment}` : '不加價'}</span>
              </label>
            ))}
          </fieldset>
        ))}
        {error && (
          <p className="cart-error" role="alert">
            {error}
          </p>
        )}
        {!complete && (
          <p className="options-dialog__hint">請為每個規格群組選擇一項，才能加入購物車。</p>
        )}
        <div className="options-dialog__actions">
          <button type="button" className="text-button" onClick={onClose}>取消</button>
          <button type="submit" className="action-button" disabled={busy || !complete}>
            加入購物車
          </button>
        </div>
      </form>
    </div>
  );
}
