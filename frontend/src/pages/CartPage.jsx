export default function CartPage({
  cart,
  cartError,
  cartBusy,
  orderBusy,
  orderError,
  onUpdateQuantity,
  onDeleteItem,
  onSubmitOrder,
}) {
  return (
    <section className="cart-view" aria-label="購物車">
      <div className="cart-view__heading">
        <h2>購物車</h2>
        <span>{cart.items.length} 項</span>
      </div>
      {cartError && <p className="cart-error" role="alert">{cartError}</p>}
      {orderError && <p className="cart-error" role="alert">{orderError}</p>}
      {cart.items.length === 0 ? (
        <p className="menu-page__empty">購物車目前是空的。</p>
      ) : (
        <>
          <div className="cart-items">
            {cart.items.map((item) => (
              <article className="cart-item" key={item.id}>
                <div className="cart-item__details">
                  <h3>{item.menu_item_name ?? item.name}</h3>
                  {(item.options ?? item.selected_options)?.length > 0 && (
                    <p>{(item.options ?? item.selected_options).map((option) => option.option_name ?? option.name).join('、')}</p>
                  )}
                  {item.availability === 'unavailable' && <p className="unavailable-label">餐點或規格已停止供應</p>}
                </div>
                <div className="cart-item__controls">
                  {item.availability === 'available' && <strong>NT$ {item.line_total ?? item.item_total}</strong>}
                  <div className="quantity-controls" aria-label={`${item.menu_item_name ?? item.name} 數量`}>
                    <button
                      type="button"
                      aria-label={`減少 ${item.menu_item_name ?? item.name} 數量`}
                      disabled={item.availability !== 'available' || cartBusy || item.quantity <= 1}
                      onClick={() => onUpdateQuantity(item, item.quantity - 1)}
                    >−</button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`增加 ${item.menu_item_name ?? item.name} 數量`}
                      disabled={item.availability !== 'available' || cartBusy}
                      onClick={() => onUpdateQuantity(item, item.quantity + 1)}
                    >+</button>
                  </div>
                  <button type="button" className="text-button" disabled={cartBusy} onClick={() => onDeleteItem(item)}>
                    移除
                  </button>
                </div>
              </article>
            ))}
          </div>
          <footer className="cart-total">
            <span>總金額</span>
            <strong>NT$ {cart.total}</strong>
            <button
              type="button"
              className="action-button"
              disabled={cartBusy || orderBusy || cart.total === '0.00'}
              onClick={onSubmitOrder}
            >
              確認送單
            </button>
          </footer>
        </>
      )}
    </section>
  );
}
