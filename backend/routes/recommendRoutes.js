const express = require('express');
const { getRecommendations } = require('../controllers/recommendController');
const { protect } = require('../middleware/auth');
const { validateRecommend } = require('../middleware/validate');

const router = express.Router();

/**
 * POST /api/recommend
 * Public: pass interests in body.
 * Authenticated: profile interests are merged automatically.
 *
 * The protect middleware here is optional — if no token is provided,
 * the route still works using body interests only.
 */
router.post(
  '/',
  (req, res, next) => {
    // Try to authenticate but don't block if no token
    const { protect: auth } = require('../middleware/auth');
    const jwt = require('jsonwebtoken');
    const token =
      req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null;

    if (token) {
      return auth(req, res, next);
    }
    next();
  },
  validateRecommend,
  getRecommendations
);

module.exports = router;
