/**
 * Error handling middleware
 * Standardizes error responses across the API
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Handle specific error types
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

  // Default error response
  res.status(err.status || 500).json({
    error: err.error || 'Internal server error',
    message: err.message || 'An unexpected error occurred',
  });
}

/**
 * 404 Not Found middleware
 */
function notFound(req, res) {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested resource does not exist',
  });
}

/**
 * Support deterministic time for testing via headers
 * x-test-now header can override system time
 */
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
