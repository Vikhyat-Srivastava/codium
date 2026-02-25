const Society = require('../models/Society');
const Announcement = require('../models/Announcement');
const { sendSuccess, sendError, buildPaginationMeta } = require('../utils/apiResponse');
const { parsePaginationQuery } = require('../utils/pagination');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    Get all societies (with pagination, search, sort, category filter)
 * @route   GET /api/societies
 * @access  Public
 * @query   page, limit, sort, search, category
 */
const getSocieties = async (req, res, next) => {
  try {
    const { page, limit, skip, sortField } = parsePaginationQuery(req.query);

    // ── Build filter ──────────────────────────────────────────────────────
    const filter = { isActive: true };

    // Full-text search
    if (req.query.search && req.query.search.trim()) {
      filter.$text = { $search: req.query.search.trim() };
    }

    // Category filter
    if (req.query.category) {
      filter.category = req.query.category.toLowerCase();
    }

    // ── Query ─────────────────────────────────────────────────────────────
    const [societies, total] = await Promise.all([
      Society.find(filter)
        .populate('createdBy', 'name email')
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean(),
      Society.countDocuments(filter),
    ]);

    return sendSuccess(
      res,
      200,
      'Societies fetched successfully.',
      societies,
      buildPaginationMeta(total, page, limit)
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single society by ID
 * @route   GET /api/societies/:id
 * @access  Public
 */
const getSocietyById = async (req, res, next) => {
  try {
    const society = await Society.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('announcements'); // virtual count

    if (!society || !society.isActive) {
      return next(new AppError('Society not found.', 404));
    }

    return sendSuccess(res, 200, 'Society fetched.', society);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new society
 * @route   POST /api/societies
 * @access  Admin only
 */
const createSociety = async (req, res, next) => {
  try {
    const { name, category, description, tags, memberCount } = req.body;

    const society = await Society.create({
      name,
      category,
      description,
      tags:        tags        || [],
      memberCount: memberCount || 0,
      createdBy:   req.user.id,
    });

    await society.populate('createdBy', 'name email');

    return sendSuccess(res, 201, 'Society created successfully.', society);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a society
 * @route   PUT /api/societies/:id
 * @access  Admin only
 */
const updateSociety = async (req, res, next) => {
  try {
    const allowed = ['name', 'category', 'description', 'tags', 'memberCount', 'isActive'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const society = await Society.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!society) return next(new AppError('Society not found.', 404));

    return sendSuccess(res, 200, 'Society updated successfully.', society);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Soft-delete a society (sets isActive = false)
 * @route   DELETE /api/societies/:id
 * @access  Admin only
 */
const deleteSociety = async (req, res, next) => {
  try {
    const society = await Society.findById(req.params.id);
    if (!society) return next(new AppError('Society not found.', 404));

    // Soft delete — preserves data integrity with linked announcements
    society.isActive = false;
    await society.save();

    return sendSuccess(res, 200, 'Society deleted successfully.', null);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSocieties,
  getSocietyById,
  createSociety,
  updateSociety,
  deleteSociety,
};
