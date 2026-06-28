const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.name || 'Error'}: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // sequelize unique constraint violation
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'A record with this information already exists.',
      errors: err.errors ? err.errors.map((e) => ({ field: e.path, message: e.message })) : null,
      timestamp: new Date().toISOString(),
    });
  }

  // sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error.',
      errors: err.errors ? err.errors.map((e) => ({ field: e.path, message: e.message })) : null,
      timestamp: new Date().toISOString(),
    });
  }

  // sequelize foreign key constraint violation
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Referenced record does not exist.',
      errors: null,
      timestamp: new Date().toISOString(),
    });
  }

  // jwt errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
      errors: null,
      timestamp: new Date().toISOString(),
    });
  }

  // custom application errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || null,
      timestamp: new Date().toISOString(),
    });
  }

  // default 500
  return res.status(500).json({
    success: false,
    message: 'An unexpected error occurred. Please try again later.',
    errors: null,
    timestamp: new Date().toISOString(),
  });
};

export default errorHandler;
