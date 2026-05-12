function errorHandler(err, req, res, next) {
  console.error(err.stack || err.message);

  // MongoDB duplicate key (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const messages = { email: 'Email уже зарегистрирован' };
    return res.status(409).json({ error: messages[field] || `Дублирующееся значение: ${field}` });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ error: message });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Недействительный или истёкший токен' });
  }

  const status = err.status || 500;
  const message = err.status ? err.message : 'Internal server error';

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
