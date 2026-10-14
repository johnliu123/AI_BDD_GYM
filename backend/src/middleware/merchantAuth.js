import { hasAnyMerchantCredentials, resolveMerchantRolesForToken } from '../config/merchantCredentials.js';
import { safeEqual } from '../utils/safeEqual.js';

export function requireMerchantAuth(req, res, next) {
  if (!hasAnyMerchantCredentials()) {
    return res.status(503).json({
      error: {
        code: 'MERCHANT_NOT_CONFIGURED',
        message: '店家功能尚未設定。',
      },
    });
  }

  const token = (req.headers['x-merchant-token'] || req.headers['X-Merchant-Token'] || '').toString();
  if (!token) {
    return res.status(401).json({
      error: {
        code: 'MERCHANT_UNAUTHORIZED',
        message: '店家憑證無效。',
      },
    });
  }

  const roles = resolveMerchantRolesForToken(token);
  if (!roles) {
    return res.status(401).json({
      error: {
        code: 'MERCHANT_UNAUTHORIZED',
        message: '店家憑證無效。',
      },
    });
  }

  req.merchantToken = token;
  req.merchantRoles = roles;
  next();
}

export function requireMerchantRole(...allowedRoles) {
  return (req, res, next) => {
    requireMerchantAuth(req, res, () => {
      if (res.headersSent) {
        return;
      }

      const roles = req.merchantRoles || [];
      const allowed = new Set(allowedRoles);
      const hasRole = roles.some((role) => allowed.has(role) || role === 'admin');
      if (!hasRole) {
        return res.status(403).json({
          error: {
            code: 'MERCHANT_FORBIDDEN',
            message: '此操作需要更高權限。',
          },
        });
      }
      next();
    });
  };
}

export { safeEqual };
