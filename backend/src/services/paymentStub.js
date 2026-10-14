export function resolvePaymentOutcome({ simulateOutcome } = {}) {
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.ALLOW_PAYMENT_SIMULATE_BODY === 'true' &&
    simulateOutcome
  ) {
    return simulateOutcome === 'failure' ? 'failure' : 'success';
  }
  return process.env.PAYMENT_SIMULATE_OUTCOME === 'failure' ? 'failure' : 'success';
}

export const PAYMENT_FAILURE_MESSAGE = '模擬付款失敗';
