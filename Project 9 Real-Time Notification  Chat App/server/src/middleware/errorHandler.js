export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status >= 500) console.error('[error]', err);
  res.status(status).json({
    success: false,
    data: null,
    message: err.message || 'Internal server error'
  });
}
