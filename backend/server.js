require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB          = require('./config/db');
const { errorHandler }   = require('./middleware/errorHandler');
const { sendError }      = require('./utils/apiResponse');

// ─── Route imports ─────────────────────────────────────────────────────────
const authRoutes         = require('./routes/authRoutes');
const societyRoutes      = require('./routes/societyRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const recommendRoutes    = require('./routes/recommendRoutes');

// ─── Connect to MongoDB ─────────────────────────────────────────────────────
connectDB();

const app = express();

// ─── Security headers ────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin:      process.env.CLIENT_URL || '*',
    methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Sanitise against NoSQL injection ────────────────────────────────────────
app.use(mongoSanitize());

// ─── HTTP request logger (dev only) ──────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Global rate limiter ──────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:      parseInt(process.env.RATE_LIMIT_MAX)        || 100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Too many requests from this IP — please try again after 15 minutes.',
  },
});

// ─── Stricter limiter for auth routes ────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             20,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Too many login attempts — please try again after 15 minutes.',
  },
});

app.use('/api', globalLimiter);
app.use('/api/auth', authLimiter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Society API is running.',
    version: '1.0.0',
    env:     process.env.NODE_ENV,
    time:    new Date().toISOString(),
  });
});

// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/societies',     societyRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/recommend',     recommendRoutes);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  sendError(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
});

// ─── Centralised error handler (must be last) ─────────────────────────────────
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀  Smart Society API running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📡  Listening on http://localhost:${PORT}`);
  console.log(`❤️   Health check: http://localhost:${PORT}/health\n`);
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n⚠️   ${signal} received — shutting down gracefully…`);
  server.close(() => {
    console.log('✅  HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  console.error('❌  Unhandled promise rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = app;
