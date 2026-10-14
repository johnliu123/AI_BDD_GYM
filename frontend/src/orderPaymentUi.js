const DEFAULT_STALE_SEC = 120;

export function isPaymentPendingStale(paymentStatusUpdatedAt, nowMs = Date.now(), staleSec = DEFAULT_STALE_SEC) {
  if (!paymentStatusUpdatedAt) {
    return true;
  }
  const updatedMs = Date.parse(paymentStatusUpdatedAt);
  if (Number.isNaN(updatedMs)) {
    return true;
  }
  return nowMs - updatedMs >= staleSec * 1000;
}

export function canPayOrder(order) {
  if (!order || order.status === 'cancelled') {
    return false;
  }
  const ps = order.payment_status ?? 'unpaid';
  if (ps === 'paid') {
    return false;
  }
  if (ps === 'pending') {
    return isPaymentPendingStale(order.payment_status_updated_at);
  }
  return ps === 'unpaid' || ps === 'failed';
}

export function canCancelOrder(order) {
  if (!order || order.status !== 'created') {
    return false;
  }
  if (order.payment_status === 'pending' && !isPaymentPendingStale(order.payment_status_updated_at)) {
    return false;
  }
  return true;
}

export function paymentActionErrorMessage(error) {
  if (error?.message && error.status && error.status < 500) {
    return error.message;
  }
  return '操作失敗，請稍後再試。';
}
