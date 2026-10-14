import { toClientErrorPayload } from '../utils/clientError.js';
import { logServerError } from '../utils/safeLogger.js';

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: '找不到請求的資源。',
    },
  });
}

export function errorMiddleware(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const { status: resolvedStatus, body } = toClientErrorPayload(error, error?.exposedMessage || '請求無法完成。');
  if (resolvedStatus >= 500) {
    logServerError('http.unhandled', error, { path: req.path, method: req.method });
  }
  res.status(resolvedStatus).json(body);
}
