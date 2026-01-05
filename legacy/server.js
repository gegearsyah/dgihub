/**
 * DGIHub Platform Server
 * Main application entry point
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import routes
const apiRoutes = require('./api/routes/index');

// Import middleware
const { errorHandler } = require('./api/middleware/errorHandler');
const { notFoundHandler } = require('./api/middleware/notFoundHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// Middleware
// ============================================================================

// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// ============================================================================
// Health Check
// ============================================================================

app.get('/health', async (req, res) => {
  try {
    const { pool } = require('./api/config/database');
    await pool.query('SELECT 1');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// ============================================================================
// API Routes
// ============================================================================

app.use('/api/v1', apiRoutes);

// ============================================================================
// Error Handling
// ============================================================================

app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================================
// Server Start
// ============================================================================

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           DGIHub Platform Server Started                   ║
╠═══════════════════════════════════════════════════════════╣
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(45)}║
║  Port: ${String(PORT).padEnd(52)}║
║  Health: http://localhost:${PORT}/health${' '.repeat(25 - String(PORT).length)}║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    const { pool } = require('./api/config/database');
    pool.end(() => {
      console.log('Database connections closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    const { pool } = require('./api/config/database');
    pool.end(() => {
      console.log('Database connections closed');
      process.exit(0);
    });
  });
});

module.exports = app;

