export default function errorHandler(err, req, res, _next) {
  const status = err.status || 400;
  res.status(status).json({ message: err.message || 'Bad request' });
}
