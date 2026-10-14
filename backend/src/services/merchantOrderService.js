import {
  isValidOrderStatus,
  nextStatusForAction,
  statusLabelFor,
} from '../lib/orderStatus.js';
import { isValidPaymentStatus, paymentStatusLabelFor } from '../lib/paymentStatus.js';
import {
  listOrdersForMerchant,
  loadOrderByOrderNumber,
  transitionOrderStatus,
} from '../repositories/orderRepository.js';

const LIST_LIMIT = 200;

function orderNotFoundError() {
  const error = new Error('ORDER_NOT_FOUND');
  error.code = 'ORDER_NOT_FOUND';
  error.status = 404;
  return error;
}

function statusConflictError() {
  const error = new Error('ORDER_STATUS_CONFLICT');
  error.code = 'ORDER_STATUS_CONFLICT';
  error.status = 409;
  return error;
}

function invalidStatusFilterError() {
  const error = new Error('INVALID_STATUS_FILTER');
  error.code = 'INVALID_STATUS_FILTER';
  error.status = 400;
  return error;
}

function invalidPaymentFilterError() {
  const error = new Error('INVALID_PAYMENT_STATUS_FILTER');
  error.code = 'INVALID_PAYMENT_STATUS_FILTER';
  error.status = 400;
  return error;
}

export function toMerchantSummary(order) {
  return {
    order_number: order.order_number,
    status: order.status,
    status_label: order.status_label,
    payment_status: order.payment_status,
    payment_status_label: order.payment_status_label,
    created_at: order.created_at,
    status_updated_at: order.status_updated_at ?? null,
    total: order.total,
  };
}

export async function listMerchantOrders(statusFilter, paymentStatusFilter) {
  if (statusFilter !== undefined && statusFilter !== null && String(statusFilter).trim() !== '') {
    if (!isValidOrderStatus(statusFilter)) {
      throw invalidStatusFilterError();
    }
  } else {
    statusFilter = null;
  }

  if (
    paymentStatusFilter !== undefined &&
    paymentStatusFilter !== null &&
    String(paymentStatusFilter).trim() !== ''
  ) {
    if (!isValidPaymentStatus(paymentStatusFilter)) {
      throw invalidPaymentFilterError();
    }
  } else {
    paymentStatusFilter = null;
  }

  const rows = await listOrdersForMerchant({
    status: statusFilter,
    paymentStatus: paymentStatusFilter,
    limit: LIST_LIMIT,
  });
  return { orders: rows.map(toMerchantSummary) };
}

export async function getMerchantOrder(orderNumber) {
  const order = await loadOrderByOrderNumber(orderNumber);
  if (!order) {
    throw orderNotFoundError();
  }
  return order;
}

async function applyTransition(orderNumber, action) {
  const existing = await loadOrderByOrderNumber(orderNumber);
  if (!existing) {
    throw orderNotFoundError();
  }
  if (existing.status === 'cancelled') {
    throw statusConflictError();
  }

  const mapping = nextStatusForAction(action);
  if (!mapping) {
    throw statusConflictError();
  }

  const updated = await transitionOrderStatus(orderNumber, mapping.expected, mapping.next);
  if (!updated) {
    const existing = await loadOrderByOrderNumber(orderNumber);
    if (!existing) {
      throw orderNotFoundError();
    }
    throw statusConflictError();
  }

  return updated;
}

export async function acceptMerchantOrder(orderNumber) {
  return applyTransition(orderNumber, 'accept');
}

export async function startPreparingMerchantOrder(orderNumber) {
  return applyTransition(orderNumber, 'start-preparing');
}

export async function completeMerchantOrder(orderNumber) {
  return applyTransition(orderNumber, 'complete');
}

export { statusLabelFor };
