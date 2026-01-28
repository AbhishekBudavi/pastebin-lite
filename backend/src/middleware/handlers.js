function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  if (err.status === 404) {
    return res.status(404).json({
      error: 'Not found',
      message: err.message,
    });
  }

  if (err.status === 400) {
    return res.status(400).json({
      error: 'Bad request',
      message: err.message,
    });
  }
  res.status(err.status || 500).json({
    error: err.error || 'Internal server error',
    message: err.message || 'An unexpected error occurred',
  });
}

function notFound(req, res) {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested resource does not exist',
  });
}

function testTimeMiddleware(req, res, next) {
  const testNow = req.headers['x-test-now'];
  if (testNow) {
    req.testNow = new Date(testNow).toISOString();
  }
  next();
}

module.exports = {
  errorHandler,
  notFound,
  testTimeMiddleware,
};
