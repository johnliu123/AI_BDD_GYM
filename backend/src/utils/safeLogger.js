function redactMessage(message) {
  if (typeof message !== 'string') {
    return 'Error';
  }

  return message
    .replace(/password=\S+/gi, 'password=[REDACTED]')
    .replace(/(Failed to connect to )\S+/gi, '$1[REDACTED_SERVER]')
    .replace(/[\w.-]+\\[\w.-]+/g, '[REDACTED_SERVER]')
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?\b/g, '[REDACTED_HOST]');
}

export function sanitizeError(error) {
  if (!error) {
    return { name: 'Error', message: 'Unknown error' };
  }

  return {
    name: error.name || 'Error',
    code: error.code ?? undefined,
    message: redactMessage(error.message),
  };
}

export function logServerError(context, error, extra = {}) {
  const payload = {
    level: 'error',
    context,
    ...extra,
    error: sanitizeError(error),
  };
  console.error(JSON.stringify(payload));
}
