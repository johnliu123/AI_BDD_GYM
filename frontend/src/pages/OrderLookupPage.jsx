import { useState } from 'react';
import OrderPaymentActions from '../components/OrderPaymentActions.jsx';

export default function OrderLookupPage({
  lookupError,
  lookupBusy,
  lookupResult,
  onLookup,
  onRefresh,
  paymentBusy = false,
  paymentError = '',
  onPay,
  onCancel,
  simulatePayFailure = false,
  onSimulatePayFailureChange,
}) {
  const [orderNumber, setOrderNumber] = useState('');

  const submit = (event) => {
    event.preventDefault();
    onLookup(orderNumber.trim());
  };

  return (
    <section className="order-lookup" aria-label="訂單查詢">
      <h2>查詢訂單</h2>
      <form className="order-lookup__form" onSubmit={submit}>
        <label htmlFor="order-number-input">訂單編號</label>
        <input
          id="order-number-input"
          value={orderNumber}
          onChange={(event) => setOrderNumber(event.target.value)}
          placeholder="ORD-YYYYMMDD-XXXXXXXX"
          disabled={lookupBusy}
        />
        <button type="submit" className="action-button" disabled={lookupBusy || !orderNumber.trim()}>
          查詢
        </button>
      </form>
      {lookupError && <p className="cart-error" role="alert">{lookupError}</p>}
      {lookupResult && (
        <article className="order-result">
          <h3>{lookupResult.order_number}</h3>
          <p>出餐狀態：{lookupResult.status_label}</p>
          <p>總金額：NT$ {lookupResult.total}</p>
          <OrderPaymentActions
            order={lookupResult}
            busy={paymentBusy || lookupBusy}
            actionError={paymentError}
            onPay={onPay ? () => onPay(lookupResult.order_number) : undefined}
            onCancel={onCancel ? () => onCancel(lookupResult.order_number) : undefined}
            simulateFailure={simulatePayFailure}
            onSimulateFailureChange={onSimulatePayFailureChange}
          />
          <ul>
            {lookupResult.items.map((item) => (
              <li key={`${item.menu_item_id}-${item.menu_item_name}`}>
                {item.menu_item_name} × {item.quantity} — NT$ {item.line_total}
              </li>
            ))}
          </ul>
          {onRefresh && (
            <button
              type="button"
              className="action-button"
              disabled={lookupBusy}
              onClick={() => onRefresh(lookupResult.order_number)}
            >
              重新查詢
            </button>
          )}
        </article>
      )}
    </section>
  );
}
