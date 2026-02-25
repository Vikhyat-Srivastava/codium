const { body, param, query, validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');
const { SOCIETY_CATEGORIES } = require('../config/constants');

/**
 * Runs express-validator results and sends a 422 if any fail.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field:   e.path,
      message: e.msg,
    }));
    return sendError(res, 422, 'Validation failed.', formatted);
  }
  next();
};

/* ─── Auth validators ────────────────────────────────────────────────────── */

const validateRegister = [
  body('name')
    .trim()
    .notEmpty()    .withMessage('Name is required.')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters.'),

  body('email')
    .trim()
    .notEmpty()    .withMessage('Email is required.')
    .isEmail()     .withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty()    .withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),

  body('role')
    .optional()
    .isIn(['student', 'admin']).withMessage('Role must be "student" or "admin".'),

  body('interests')
    .optional()
    .isArray()     .withMessage('Interests must be an array of strings.'),

  handleValidationErrors,
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail()  .withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.'),

  handleValidationErrors,
];

/* ─── Society validators ─────────────────────────────────────────────────── */

const validateSociety = [
  body('name')
    .trim()
    .notEmpty()    .withMessage('Society name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters.'),

  body('category')
    .trim()
    .notEmpty()    .withMessage('Category is required.')
    .isIn(SOCIETY_CATEGORIES)
    .withMessage(`Category must be one of: ${SOCIETY_CATEGORIES.join(', ')}.`),

  body('description')
    .trim()
    .notEmpty()    .withMessage('Description is required.')
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters.'),

  body('tags')
    .optional()
    .isArray()     .withMessage('Tags must be an array of strings.'),

  handleValidationErrors,
];

/* ─── Announcement validators ────────────────────────────────────────────── */

const validateAnnouncement = [
  body('society')
    .notEmpty()   .withMessage('Society ID is required.')
    .isMongoId()  .withMessage('Society must be a valid MongoDB ObjectId.'),

  body('title')
    .trim()
    .notEmpty()   .withMessage('Title is required.')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3–200 characters.'),

  body('content')
    .trim()
    .notEmpty()   .withMessage('Content is required.')
    .isLength({ max: 5000 }).withMessage('Content cannot exceed 5000 characters.'),

  body('eventDate')
    .optional()
    .isISO8601()  .withMessage('eventDate must be a valid ISO 8601 date.'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Location cannot exceed 200 characters.'),

  handleValidationErrors,
];

/* ─── Recommendation validator ───────────────────────────────────────────── */

const validateRecommend = [
  body('interests')
    .isArray({ min: 1 }).withMessage('Interests must be a non-empty array of strings.'),

  body('interests.*')
    .isString().withMessage('Each interest must be a string.')
    .trim()
    .notEmpty() .withMessage('Interest values cannot be empty strings.'),

  handleValidationErrors,
];

/* ─── ObjectId param validator ───────────────────────────────────────────── */

const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId().withMessage(`${paramName} must be a valid MongoDB ObjectId.`),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateSociety,
  validateAnnouncement,
  validateRecommend,
  validateObjectId,
};
