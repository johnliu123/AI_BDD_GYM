import { canCancelOrder, canPayOrder } from '../orderPaymentUi.js';

export default function OrderPaymentActions({
  order,
  busy = false,
  actionError = '',
  onPay,
  onCancel,
  simulateFailure = false,
  onSimulateFailureChange,
}) {
  if (!order) {
    return null;
  }

  const showPay = canPayOrder(order);
  const showCancel = canCancelOrder(order);
  const showDevSimulate = import.meta.env.DEV && onSimulateFailureChange;

  return (
    <div className="order-payment-actions">
      <p>
        付款：{order.payment_status_label ?? order.payment_status ?? '—'}
      </p>
      {order.payment_failure_reason && (
        <p className="order-payment-actions__reason" role="status">
          失敗原因：{order.payment_failure_reason}
        </p>
      )}
      {actionError && (
        <p className="cart-error" role="alert">
          {actionError}
        </p>
      )}
      {showDevSimulate && (
        <p className="order-payment-actions__simulate-hint">
          後端須設 <code>ALLOW_PAYMENT_SIMULATE_BODY=true</code> 才會依勾選送出失敗。
        </p>
      )}
      {showDevSimulate && (
        <label className="order-payment-actions__simulate">
          <input
            type="checkbox"
            checked={simulateFailure}
            disabled={busy}
            onChange={(event) => onSimulateFailureChange(event.target.checked)}
          />
          下次付款模擬失敗（dev）
        </label>
      )}
      <div className="order-payment-actions__buttons">
        {showPay && (
          <button type="button" className="action-button" disabled={busy} onClick={onPay}>
            付款
          </button>
        )}
        {showCancel && (
          <button type="button" className="action-button" disabled={busy} onClick={onCancel}>
            取消訂單
          </button>
        )}
      </div>
    </div>
  );
}
