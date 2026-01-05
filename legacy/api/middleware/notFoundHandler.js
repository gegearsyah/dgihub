/**
 * Not Found Handler Middleware
 */

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: {
      auth: '/api/v1/auth',
      mitra: '/api/v1/mitra',
      talenta: '/api/v1/talenta',
      industri: '/api/v1/industri',
      health: '/health'
    }
  });
};

module.exports = { notFoundHandler };
