import { ensureSession } from '../services/cartService.js';

export async function attachGuestSession(req, res, next) {
  try {
    const session = await ensureSession(req, res);
    if (!session) {
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
}
