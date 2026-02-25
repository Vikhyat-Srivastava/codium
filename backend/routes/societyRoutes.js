const express = require('express');
const {
  getSocieties,
  getSocietyById,
  createSociety,
  updateSociety,
  deleteSociety,
} = require('../controllers/societyController');
const { protect, authorise } = require('../middleware/auth');
const { validateSociety, validateObjectId } = require('../middleware/validate');

const router = express.Router();

// GET  /api/societies          — public, paginated + search
// POST /api/societies          — admin only
router
  .route('/')
  .get(getSocieties)
  .post(protect, authorise('admin'), validateSociety, createSociety);

// GET    /api/societies/:id    — public
// PUT    /api/societies/:id    — admin only
// DELETE /api/societies/:id    — admin only
router
  .route('/:id')
  .get(validateObjectId('id'), getSocietyById)
  .put(protect, authorise('admin'), validateObjectId('id'), validateSociety, updateSociety)
  .delete(protect, authorise('admin'), validateObjectId('id'), deleteSociety);

module.exports = router;
