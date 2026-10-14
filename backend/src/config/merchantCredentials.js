import { safeEqual } from '../utils/safeEqual.js';

function parseCredentialsJson(raw) {
  if (!raw?.trim()) {
    return [];
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) {
    return null;
  }
  const entries = [];
  for (const row of parsed) {
    const token = row?.token?.toString?.()?.trim();
    const roles = Array.isArray(row?.roles) ? row.roles.map((r) => String(r).trim()).filter(Boolean) : [];
    if (token && roles.length > 0) {
      entries.push({ token, roles });
    }
  }
  return entries;
}

export function loadMerchantCredentialEntries() {
  const entries = [];
  const fromJson = parseCredentialsJson(process.env.MERCHANT_CREDENTIALS);
  const invalidJson = fromJson === null && Boolean(process.env.MERCHANT_CREDENTIALS?.trim());
  if (fromJson) {
    entries.push(...fromJson);
  }

  const legacy = process.env.MERCHANT_TOKEN?.trim();
  if (legacy) {
    entries.push({ token: legacy, roles: ['admin'] });
  }

  return { entries, invalidJson };
}

export function resolveMerchantRolesForToken(token) {
  const { entries } = loadMerchantCredentialEntries();
  let matchedRoles = null;
  for (const entry of entries) {
    if (safeEqual(entry.token, token) && !matchedRoles) {
      matchedRoles = entry.roles;
    }
  }
  return matchedRoles;
}

export function hasAnyMerchantCredentials() {
  const { entries } = loadMerchantCredentialEntries();
  return entries.length > 0;
}

let warnedInvalidMerchantCredentialsJson = false;

export function warnIfInvalidMerchantCredentialsJson() {
  if (warnedInvalidMerchantCredentialsJson) {
    return;
  }
  const { invalidJson } = loadMerchantCredentialEntries();
  if (!invalidJson) {
    return;
  }
  warnedInvalidMerchantCredentialsJson = true;
  console.warn(
    '[merchant-credentials] MERCHANT_CREDENTIALS is not valid JSON; entries from that variable are ignored. MERCHANT_TOKEN fallback still applies if set.'
  );
}
