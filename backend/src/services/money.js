export function moneyToCents(value) {
  if (typeof value === 'bigint') {
    return value;
  }

  if (typeof value === 'number') {
    return BigInt(Math.round(value * 100));
  }

  const source = String(value ?? '0').trim();

  if (!source || source === '0') {
    return 0n;
  }

  const sign = source.startsWith('-') ? -1n : 1n;
  const normalized = source.replace(/^[-+]/, '');
  const [wholePart = '0', fractionalPart = ''] = normalized.split('.');
  const safeFraction = (fractionalPart + '00').slice(0, 2);
  const integerPart = BigInt(wholePart || '0');

  return sign * (integerPart * 100n + BigInt(safeFraction));
}

export function formatMoney(value) {
  const cents = moneyToCents(value);
  const sign = cents < 0n ? '-' : '';
  const absoluteCents = cents < 0n ? -cents : cents;
  const whole = absoluteCents / 100n;
  const fractional = (absoluteCents % 100n).toString().padStart(2, '0');
  return `${sign}${whole}.${fractional}`;
}

export function addMoneyStrings(left, right) {
  return formatMoney(moneyToCents(left) + moneyToCents(right));
}

export function sumMoneyStrings(values) {
  return formatMoney(values.reduce((total, value) => total + moneyToCents(value), 0n));
}
