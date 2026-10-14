export const ORDER_STATUSES = ['created', 'accepted', 'preparing', 'completed', 'cancelled'];

const STATUS_LABELS = {
  created: '已建立',
  accepted: '已接單',
  preparing: '出餐中',
  completed: '已完成',
  cancelled: '已取消',
};

const TRANSITIONS = {
  created: 'accepted',
  accepted: 'preparing',
  preparing: 'completed',
};

export function statusLabelFor(status) {
  return STATUS_LABELS[status] ?? status;
}

export function isValidOrderStatus(status) {
  return ORDER_STATUSES.includes(status);
}

export function nextStatusForAction(action) {
  if (action === 'accept') {
    return { expected: 'created', next: 'accepted' };
  }
  if (action === 'start-preparing') {
    return { expected: 'accepted', next: 'preparing' };
  }
  if (action === 'complete') {
    return { expected: 'preparing', next: 'completed' };
  }
  return null;
}

export function assertTransition(from, to) {
  if (TRANSITIONS[from] !== to) {
    const error = new Error('ORDER_STATUS_CONFLICT');
    error.code = 'ORDER_STATUS_CONFLICT';
    error.status = 409;
    throw error;
  }
}
