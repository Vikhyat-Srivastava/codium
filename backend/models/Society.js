const mongoose = require('mongoose');
const { SOCIETY_CATEGORIES } = require('../config/constants');

const SocietySchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Society name is required'],
      trim:      true,
      unique:    true,
      minlength: [2,   'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    category: {
      type:     String,
      required: [true, 'Category is required'],
      enum: {
        values:  SOCIETY_CATEGORIES,
        message: `Category must be one of: ${SOCIETY_CATEGORIES.join(', ')}`,
      },
      lowercase: true,
    },

    description: {
      type:      String,
      required:  [true, 'Description is required'],
      trim:      true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    tags: {
      type:    [String],
      default: [],
    },

    memberCount: {
      type:    Number,
      default: 0,
      min:     0,
    },

    isActive: {
      type:    Boolean,
      default: true,
    },

    createdBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },

    createdAt: {
      type:    Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

/* ─── Indexes ──────────────────────────────────────────────────────────────── */
SocietySchema.index({ name: 'text', description: 'text', tags: 'text' }); // full-text search
SocietySchema.index({ category: 1 });
SocietySchema.index({ createdAt: -1 });

/* ─── Virtual: announcement count ──────────────────────────────────────────── */
SocietySchema.virtual('announcements', {
  ref:          'Announcement',
  localField:   '_id',
  foreignField: 'society',
  count:        true,
});

module.exports = mongoose.model('Society', SocietySchema);
