/**
 * Authentication Middleware
 */

const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verify user still exists and is active
      const userResult = await pool.query(
        'SELECT user_id, email, full_name, user_type, status FROM users WHERE user_id = $1',
        [decoded.userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = userResult.rows[0];

      if (user.status !== 'VERIFIED' && user.status !== 'ACTIVE') {
        return res.status(403).json({
          success: false,
          message: 'Account not verified or inactive'
        });
      }

      req.user = {
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        userType: user.user_type
      };

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired'
        });
      }
      throw error;
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Check if user has required user type
 */
const requireUserType = (...allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedTypes.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required user type: ${allowedTypes.join(' or ')}`
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  requireUserType
};

