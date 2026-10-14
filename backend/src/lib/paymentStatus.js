export const PAYMENT_STATUSES = ['unpaid', 'pending', 'paid', 'failed', 'refunded'];

const PAYMENT_LABELS = {
  unpaid: '未付款',
  pending: '付款處理中',
  paid: '已付款',
  failed: '付款失敗',
  refunded: '已退款',
};

export function paymentStatusLabelFor(status) {
  return PAYMENT_LABELS[status] ?? status;
}

export function isValidPaymentStatus(status) {
  return PAYMENT_STATUSES.includes(status);
}

export function paymentPendingStaleSec() {
  return Number(process.env.PAYMENT_PENDING_STALE_SEC || 120);
}

export function isPaymentPendingStale(paymentStatusUpdatedAt, nowMs = Date.now()) {
  if (!paymentStatusUpdatedAt) {
    return true;
  }
  const updatedMs = Date.parse(paymentStatusUpdatedAt);
  if (Number.isNaN(updatedMs)) {
    return true;
  }
  return nowMs - updatedMs >= paymentPendingStaleSec() * 1000;
}
