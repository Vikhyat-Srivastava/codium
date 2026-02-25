const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { ROLES } = require('../config/constants');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Name is required'],
      trim:      true,
      minlength: [2,  'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },

    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },

    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select:    false, // never return password in queries by default
    },

    role: {
      type:    String,
      enum:    {
        values:  Object.values(ROLES),
        message: 'Role must be either "student" or "admin"',
      },
      default: ROLES.STUDENT,
    },

    interests: {
      type:    [String],
      default: [],
    },

    createdAt: {
      type:    Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

/* ─── Pre-save: hash password ──────────────────────────────────────────────── */
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  this.password    = await bcrypt.hash(this.password, saltRounds);
  next();
});

/* ─── Instance method: compare password ────────────────────────────────────── */
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/* ─── Instance method: generate JWT ────────────────────────────────────────── */
UserSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/* ─── Transform: strip password from JSON output ───────────────────────────── */
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('User', UserSchema);
