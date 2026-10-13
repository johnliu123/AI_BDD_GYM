import crypto from 'node:crypto';

function safeEqual(a, b) {
  const left = Buffer.from(String(a), 'utf8');
  const right = Buffer.from(String(b), 'utf8');
  const maxLen = Math.max(left.length, right.length);
  const paddedLeft = Buffer.alloc(maxLen);
  const paddedRight = Buffer.alloc(maxLen);
  left.copy(paddedLeft);
  right.copy(paddedRight);
  return crypto.timingSafeEqual(paddedLeft, paddedRight) && left.length === right.length;
}

export function requireMerchantAuth(req, res, next) {
  const configured = process.env.MERCHANT_TOKEN?.trim();
  if (!configured) {
    return res.status(503).json({
      error: {
        code: 'MERCHANT_NOT_CONFIGURED',
        message: '店家功能尚未設定。',
      },
    });
  }

  const token = (req.headers['x-merchant-token'] || req.headers['X-Merchant-Token'] || '').toString();
  if (!token || !safeEqual(token, configured)) {
    return res.status(401).json({
      error: {
        code: 'MERCHANT_UNAUTHORIZED',
        message: '店家憑證無效。',
      },
    });
  }

  next();
}
