const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const authRoutes     = require('./routes/auth.routes');
const productRoutes  = require('./routes/product.routes');
const reviewRoutes   = require('./routes/review.routes');
const brandRoutes    = require('./routes/brand.routes');
const categoryRoutes = require('./routes/category.routes');
const chatRoutes     = require('./routes/chat.routes');
const orderRoutes    = require('./routes/order.routes');
const imageRoutes    = require('./routes/image.routes');
const adminRoutes    = require('./routes/admin.routes');
const storeRoutes    = require('./routes/store.routes');
const notificationRoutes = require('./routes/notification.routes');
const slideRoutes        = require('./routes/slide.routes');

const app = express();

// ─── Security ──────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow images
  contentSecurityPolicy: false, // SPA handles this
}));

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 100,
  message: { error: 'Слишком много попыток. Повторите через минуту.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 300,
  message: { error: 'Слишком много запросов.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Performance ───────────────────────────────────────────────────────────
app.use(compression());

// ─── General middleware ─────────────────────────────────────────────────────
app.use(morgan('dev'));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',       authLimiter, authRoutes);
app.use('/api/products',   apiLimiter,  productRoutes);
app.use('/api',            apiLimiter,  reviewRoutes);
app.use('/api/brands',     apiLimiter,  brandRoutes);
app.use('/api/categories', apiLimiter,  categoryRoutes);
app.use('/api/chat',       apiLimiter,  chatRoutes);
app.use('/api/orders',     apiLimiter,  orderRoutes);
app.use('/api/images',     imageRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/stores',     storeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/slides',       apiLimiter, slideRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

module.exports = app;
