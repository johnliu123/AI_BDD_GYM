export function createHttpError(code, status, message) {
  const error = new Error(code);
  error.code = code;
  error.status = status;
  if (message) {
    error.exposedMessage = message;
  }
  return error;
}
