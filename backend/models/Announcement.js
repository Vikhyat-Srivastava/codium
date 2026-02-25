const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema(
  {
    society: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Society',
      required: [true, 'Society reference is required'],
    },

    title: {
      type:      String,
      required:  [true, 'Title is required'],
      trim:      true,
      minlength: [3,   'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    content: {
      type:      String,
      required:  [true, 'Content is required'],
      trim:      true,
      maxlength: [5000, 'Content cannot exceed 5000 characters'],
    },

    eventDate: {
      type: Date,
    },

    location: {
      type:      String,
      trim:      true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
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
AnnouncementSchema.index({ society: 1 });
AnnouncementSchema.index({ createdAt: -1 });
AnnouncementSchema.index({ title: 'text', content: 'text' }); // full-text search

module.exports = mongoose.model('Announcement', AnnouncementSchema);
