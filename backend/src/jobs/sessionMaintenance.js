import { runSessionMaintenance } from '../repositories/guestSessionRepository.js';
import { logServerError } from '../utils/safeLogger.js';

let timer;

export function startSessionMaintenance(intervalMs = Number(process.env.SESSION_CLEANUP_INTERVAL_MS || 60_000)) {
  if (timer) {
    return;
  }

  timer = setInterval(() => {
    runSessionMaintenance().catch((error) => {
      logServerError('session.maintenance', error);
    });
  }, intervalMs);

  if (typeof timer.unref === 'function') {
    timer.unref();
  }
}

export function stopSessionMaintenance() {
  if (timer) {
    clearInterval(timer);
    timer = undefined;
  }
}
