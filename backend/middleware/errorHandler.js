const { sendError } = require('../utils/apiResponse');

/**
 * Centralised error handler.
 * Must be registered LAST in the Express middleware chain.
 *
 * Handles:
 *  - Mongoose CastError (invalid ObjectId)
 *  - Mongoose ValidationError
 *  - Mongoose duplicate key (11000)
 *  - JWT errors (caught in auth middleware, but as safety net here too)
 *  - Generic AppError instances
 *  - Unhandled errors → 500
 */
const errorHandler = (err, req, res, _next) => {
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.error('💥 Error:', err);
  }

  let status  = err.statusCode || 500;
  let message = err.message    || 'Internal server error.';

  // ── Mongoose bad ObjectId ─────────────────────────────────────────────────
  if (err.name === 'CastError') {
    status  = 400;
    message = `Invalid value for field "${err.path}": ${err.value}`;
  }

  // ── Mongoose validation errors ────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    status  = 422;
    const errors = Object.values(err.errors).map((e) => ({
      field:   e.path,
      message: e.message,
    }));
    return sendError(res, status, 'Validation failed.', errors);
  }

  // ── Mongoose duplicate key ────────────────────────────────────────────────
  if (err.code === 11000) {
    status  = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value: "${err.keyValue[field]}" already exists for ${field}.`;
  }

  // ── JWT errors ────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError')  { status = 401; message = 'Invalid token.'; }
  if (err.name === 'TokenExpiredError')  { status = 401; message = 'Token expired — please log in again.'; }

  return sendError(res, status, message);
};

/**
 * Custom application error class.
 * Throw this from controllers to produce clean HTTP errors.
 *
 * @example  throw new AppError('Society not found', 404);
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { errorHandler, AppError };
