const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

/**
 * protect — verifies JWT from Authorization header.
 * Attaches decoded user to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  // Accept token from Bearer header or cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 401, 'Not authorised — no token provided.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return sendError(res, 401, 'Not authorised — user no longer exists.');
    }

    req.user = user;
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Session expired — please log in again.'
        : 'Not authorised — invalid token.';
    return sendError(res, 401, message);
  }
};

/**
 * authorise — role-based access control.
 * Must be used AFTER protect middleware.
 *
 * Usage: router.delete('/:id', protect, authorise('admin'), handler)
 *
 * @param {...string} roles - Allowed roles
 */
const authorise = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied — requires one of: [${roles.join(', ')}]. Your role: ${req.user.role}.`
      );
    }
    next();
  };
};

module.exports = { protect, authorise };
