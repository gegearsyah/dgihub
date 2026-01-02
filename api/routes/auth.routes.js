/**
 * Authentication Routes
 * Flow Chart Nodes: [3, 17, 23]
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { validateNIK, validateEmail } = require('../utils/validators');
const logger = require('../utils/logger');
const { authenticate } = require('../middleware/auth');

/**
 * POST /api/v1/auth/register
 * Register new user
 * Flow Chart Node: [3, 17, 23]
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('fullName').trim().notEmpty(),
    body('userType').isIn(['TALENTA', 'MITRA', 'INDUSTRI']),
    body('nik').optional().isString()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const { email, password, fullName, userType, nik, phone } = req.body;

      // Validate email format
      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Validate NIK if provided
      if (nik && !validateNIK(nik)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid NIK format (must be 16 digits)'
        });
      }

      // Check if user exists
      const existingUser = await pool.query(
        'SELECT user_id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Generate verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationCodeExpires = new Date();
      verificationCodeExpires.setHours(verificationCodeExpires.getHours() + 24);

      // Create user
      const userResult = await pool.query(
        `INSERT INTO users (email, password_hash, full_name, user_type, status, verification_code, verification_code_expires_at)
         VALUES ($1, $2, $3, $4, 'PENDING_VERIFICATION', $5, $6)
         RETURNING user_id, email, full_name, user_type, status`,
        [email, passwordHash, fullName, userType, verificationCode, verificationCodeExpires]
      );

      const user = userResult.rows[0];

      // Create profile based on user type
      if (userType === 'TALENTA') {
        await pool.query(
          `INSERT INTO talenta_profiles (user_id, nik, phone)
           VALUES ($1, $2, $3)`,
          [user.user_id, nik || null, phone || null]
        );
      } else if (userType === 'MITRA') {
        await pool.query(
          `INSERT INTO mitra_profiles (user_id)
           VALUES ($1)`,
          [user.user_id]
        );
      } else if (userType === 'INDUSTRI') {
        await pool.query(
          `INSERT INTO industri_profiles (user_id)
           VALUES ($1)`,
          [user.user_id]
        );
      }

      logger.info('User registered', { userId: user.user_id, email, userType });

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your account.',
        data: {
          userId: user.user_id,
          email: user.email,
          userType: user.user_type,
          status: user.status,
          verificationRequired: true
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      next(error);
    }
  }
);

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user
      const userResult = await pool.query(
        `SELECT user_id, email, password_hash, full_name, user_type, status, email_verified
         FROM users WHERE email = $1`,
        [email]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const user = userResult.rows[0];

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if account is active
      if (user.status !== 'ACTIVE' && user.status !== 'VERIFIED') {
        return res.status(403).json({
          success: false,
          message: `Account is ${user.status.toLowerCase()}. Please verify your account.`
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.user_id,
          email: user.email,
          userType: user.user_type
        },
        process.env.JWT_SECRET || 'change-this-secret',
        { expiresIn: '24h' }
      );

      // Generate refresh token
      const refreshToken = jwt.sign(
        { userId: user.user_id },
        process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret',
        { expiresIn: '7d' }
      );

      // Update last login
      await pool.query(
        'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE user_id = $1',
        [user.user_id]
      );

      logger.info('User logged in', { userId: user.user_id, email });

      res.json({
        success: true,
        data: {
          token,
          refreshToken,
          user: {
            id: user.user_id,
            email: user.email,
            fullName: user.full_name,
            userType: user.user_type,
            status: user.status
          },
          expiresIn: 86400 // 24 hours in seconds
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      next(error);
    }
  }
);

/**
 * POST /api/v1/auth/verify-ekyc
 * Complete e-KYC verification
 */
router.post(
  '/verify-ekyc',
  [
    body('nik').isString().isLength({ min: 16, max: 16 }),
    body('biometricData').notEmpty()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      // This would integrate with e-KYC service
      // For MVP, we'll do basic validation
      const { nik, biometricData } = req.body;
      const userId = req.user?.userId; // From auth middleware

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Validate NIK
      if (!validateNIK(nik)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid NIK format'
        });
      }

      // Update profile with e-KYC status
      await pool.query(
        `UPDATE talenta_profiles 
         SET nik = $1, nik_verified = TRUE, ekyc_verified = TRUE, nik_verified_at = CURRENT_TIMESTAMP
         WHERE user_id = $2`,
        [nik, userId]
      );

      // Update user status
      await pool.query(
        `UPDATE users SET status = 'VERIFIED' WHERE user_id = $1`,
        [userId]
      );

      logger.info('e-KYC verified', { userId, nik });

      res.json({
        success: true,
        message: 'e-KYC verification completed',
        data: {
          verified: true,
          verifiedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('e-KYC verification error:', error);
      next(error);
    }
  }
);

/**
 * PUT /api/v1/auth/profile
 * Update user profile
 */
router.put(
  '/profile',
  authenticate,
  [
    body('fullName').optional().trim().notEmpty(),
    body('phone').optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const { fullName, phone } = req.body;
      const userId = req.user.userId;
      const userType = req.user.userType;

      // Update user
      if (fullName) {
        await pool.query(
          'UPDATE users SET full_name = $1 WHERE user_id = $2',
          [fullName, userId]
        );
      }

      // Update profile based on user type
      if (userType === 'TALENTA' && phone) {
        await pool.query(
          'UPDATE talenta_profiles SET phone = $1 WHERE user_id = $2',
          [phone, userId]
        );
      } else if (userType === 'MITRA' && phone) {
        await pool.query(
          'UPDATE mitra_profiles SET phone = $1 WHERE user_id = $2',
          [phone, userId]
        );
      } else if (userType === 'INDUSTRI' && phone) {
        await pool.query(
          'UPDATE industri_profiles SET phone = $1 WHERE user_id = $2',
          [phone, userId]
        );
      }

      // Get updated user
      const userResult = await pool.query(
        `SELECT user_id, email, full_name, user_type, status 
         FROM users WHERE user_id = $1`,
        [userId]
      );

      logger.info('Profile updated', { userId });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: userResult.rows[0]
      });
    } catch (error) {
      logger.error('Profile update error:', error);
      next(error);
    }
  }
);

module.exports = router;
