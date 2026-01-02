/**
 * API Routes Index
 * Main router configuration
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const mitraRoutes = require('./mitra.routes');
const talentaRoutes = require('./talenta.routes');
const industriRoutes = require('./industri.routes');
const certificateRoutes = require('./certificates.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/mitra', mitraRoutes);
router.use('/talenta', talentaRoutes);
router.use('/industri', industriRoutes);
router.use('/certificates', certificateRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'DGIHub Platform API',
    version: '1.0.0',
    description: 'Indonesia Vocational Training Platform',
    endpoints: {
      auth: '/api/v1/auth',
      mitra: '/api/v1/mitra',
      talenta: '/api/v1/talenta',
      industri: '/api/v1/industri',
      certificates: '/api/v1/certificates'
    },
    documentation: 'https://docs.dgihub.go.id'
  });
});

module.exports = router;


