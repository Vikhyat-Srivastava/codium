const Announcement = require('../models/Announcement');
const Society      = require('../models/Society');
const { sendSuccess, buildPaginationMeta } = require('../utils/apiResponse');
const { parsePaginationQuery } = require('../utils/pagination');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    Get all announcements (paginated, filterable by society)
 * @route   GET /api/announcements
 * @access  Public
 * @query   page, limit, sort, society, search
 */
const getAnnouncements = async (req, res, next) => {
  try {
    const { page, limit, skip, sortField } = parsePaginationQuery(req.query);

    const filter = { isActive: true };

    // Filter by society
    if (req.query.society) {
      filter.society = req.query.society;
    }

    // Full-text search
    if (req.query.search && req.query.search.trim()) {
      filter.$text = { $search: req.query.search.trim() };
    }

    const [announcements, total] = await Promise.all([
      Announcement.find(filter)
        .populate('society',   'name category')
        .populate('createdBy', 'name email')
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean(),
      Announcement.countDocuments(filter),
    ]);

    return sendSuccess(
      res,
      200,
      'Announcements fetched successfully.',
      announcements,
      buildPaginationMeta(total, page, limit)
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single announcement
 * @route   GET /api/announcements/:id
 * @access  Public
 */
const getAnnouncementById = async (req, res, next) => {
  try {
    const ann = await Announcement.findById(req.params.id)
      .populate('society',   'name category description')
      .populate('createdBy', 'name email');

    if (!ann || !ann.isActive) return next(new AppError('Announcement not found.', 404));

    return sendSuccess(res, 200, 'Announcement fetched.', ann);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create an announcement
 * @route   POST /api/announcements
 * @access  Admin only
 */
const createAnnouncement = async (req, res, next) => {
  try {
    const { society: societyId, title, content, eventDate, location } = req.body;

    // Verify society exists and is active
    const society = await Society.findOne({ _id: societyId, isActive: true });
    if (!society) return next(new AppError('Society not found or inactive.', 404));

    const ann = await Announcement.create({
      society:   societyId,
      title,
      content,
      eventDate: eventDate || undefined,
      location:  location  || undefined,
      createdBy: req.user.id,
    });

    await ann.populate([
      { path: 'society',   select: 'name category' },
      { path: 'createdBy', select: 'name email' },
    ]);

    return sendSuccess(res, 201, 'Announcement created successfully.', ann);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update an announcement
 * @route   PUT /api/announcements/:id
 * @access  Admin only
 */
const updateAnnouncement = async (req, res, next) => {
  try {
    const allowed = ['title', 'content', 'eventDate', 'location', 'isActive'];
    const updates = {};
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    // If changing society, verify it exists
    if (req.body.society) {
      const society = await Society.findOne({ _id: req.body.society, isActive: true });
      if (!society) return next(new AppError('Target society not found or inactive.', 404));
      updates.society = req.body.society;
    }

    const ann = await Announcement.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate([
      { path: 'society',   select: 'name category' },
      { path: 'createdBy', select: 'name email' },
    ]);

    if (!ann) return next(new AppError('Announcement not found.', 404));

    return sendSuccess(res, 200, 'Announcement updated successfully.', ann);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Soft-delete an announcement
 * @route   DELETE /api/announcements/:id
 * @access  Admin only
 */
const deleteAnnouncement = async (req, res, next) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return next(new AppError('Announcement not found.', 404));

    ann.isActive = false;
    await ann.save();

    return sendSuccess(res, 200, 'Announcement deleted successfully.', null);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
