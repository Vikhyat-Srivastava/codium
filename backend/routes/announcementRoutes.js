const express = require('express');
const {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect, authorise } = require('../middleware/auth');
const { validateAnnouncement, validateObjectId } = require('../middleware/validate');

const router = express.Router();

// GET  /api/announcements      — public, paginated
// POST /api/announcements      — admin only
router
  .route('/')
  .get(getAnnouncements)
  .post(protect, authorise('admin'), validateAnnouncement, createAnnouncement);

// GET    /api/announcements/:id  — public
// PUT    /api/announcements/:id  — admin only
// DELETE /api/announcements/:id  — admin only
router
  .route('/:id')
  .get(validateObjectId('id'), getAnnouncementById)
  .put(protect, authorise('admin'), validateObjectId('id'), updateAnnouncement)
  .delete(protect, authorise('admin'), validateObjectId('id'), deleteAnnouncement);

module.exports = router;
