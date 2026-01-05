/**
 * UU PDP Compliance Audit Middleware
 * Logs all PII data access requests for compliance
 */

const { pool } = require('../config/database');

/**
 * Log PII access for UU PDP compliance
 * @param {Object} auditData - Audit log data
 */
const logPIIAccess = async (auditData) => {
  try {
    const {
      userId,
      action,
      resourceType,
      resourceId,
      piiType,
      purpose,
      ipAddress,
      userAgent,
      success = true,
      errorMessage = null,
      metadata = null
    } = auditData;

    await pool.query(
      `INSERT INTO system.pii_access_logs (
        user_id, action, resource_type, resource_id, pii_type,
        purpose, ip_address, user_agent, success, error_message, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)`,
      [
        userId,
        action,
        resourceType,
        resourceId,
        piiType,
        purpose,
        ipAddress,
        userAgent,
        success,
        errorMessage,
        metadata ? JSON.stringify(metadata) : null
      ]
    );
  } catch (error) {
    console.error('Failed to log PII access:', error);
    // Don't throw - audit logging should not break the application
  }
};

/**
 * Middleware to automatically log PII access
 */
const auditPIIAccess = (options = {}) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      // Log PII access after response
      if (req.user && options.piiTypes) {
        const piiTypes = Array.isArray(options.piiTypes) 
          ? options.piiTypes 
          : [options.piiTypes];
        
        piiTypes.forEach(piiType => {
          logPIIAccess({
            userId: req.user.userId,
            action: req.method + ' ' + req.path,
            resourceType: options.resourceType || 'API_ENDPOINT',
            resourceId: req.params.id || req.body.id || null,
            piiType: piiType,
            purpose: options.purpose || 'API_ACCESS',
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            success: res.statusCode < 400,
            metadata: {
              method: req.method,
              path: req.path,
              query: req.query,
              statusCode: res.statusCode
            }
          });
        });
      }
      
      return originalJson(data);
    };
    
    next();
  };
};

module.exports = {
  logPIIAccess,
  auditPIIAccess
};


