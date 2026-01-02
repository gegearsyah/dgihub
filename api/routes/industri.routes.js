/**
 * Industri (Employer) API Routes
 * Flow Chart Nodes: [40, 48]
 */

const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const { authenticate, requireUserType } = require('../middleware/auth');
const { auditPIIAccess } = require('../middleware/uu-pdp-audit');
const { pool } = require('../config/database');

// Apply authentication to all routes
router.use(authenticate);
router.use(requireUserType('INDUSTRI'));

/**
 * GET /api/v1/industri/search-talenta
 * Search for talent based on Sertifikat and Skills
 * Flow Chart Nodes: [40, 48]
 */
router.get(
  '/search-talenta',
  [
    query('skills').optional().isArray(),
    query('skkniCodes').optional().isArray(),
    query('aqrfLevel').optional().isInt({ min: 1, max: 8 }),
    query('location').optional().isString(),
    query('minExperience').optional().isInt({ min: 0 }),
    query('hasCertificates').optional().isBoolean(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  auditPIIAccess({ resourceType: 'TALENT_SEARCH', piiTypes: ['TALENT_PROFILE'] }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        skills = [],
        skkniCodes = [],
        aqrfLevel,
        location,
        minExperience,
        hasCertificates,
        page = 1,
        limit = 20
      } = req.query;

      const offset = (page - 1) * limit;

      // Build search query
      let queryText = `
        SELECT DISTINCT
          tp.profile_id as talenta_id,
          u.full_name,
          u.email,
          tp.city,
          tp.province,
          tp.skills,
          tp.aqrf_level,
          COUNT(DISTINCT s.sertifikat_id) as certificate_count,
          ARRAY_AGG(DISTINCT s.skkni_code) FILTER (WHERE s.skkni_code IS NOT NULL) as skkni_codes,
          MAX(s.aqrf_level) as max_aqrf_level,
          -- Calculate match score
          (
            CASE WHEN $${1}::text[] && ARRAY(SELECT jsonb_array_elements_text(tp.skills->'name')) THEN 1 ELSE 0 END +
            CASE WHEN $${2}::text[] && ARRAY_AGG(DISTINCT s.skkni_code) THEN 1 ELSE 0 END +
            CASE WHEN MAX(s.aqrf_level) >= $${3}::int THEN 1 ELSE 0 END
          ) as match_score
        FROM talenta_profiles tp
        JOIN users u ON tp.user_id = u.user_id
        LEFT JOIN sertifikat s ON tp.profile_id = s.talenta_id AND s.status = 'ACTIVE'
        WHERE u.status IN ('VERIFIED', 'ACTIVE')
          AND tp.ekyc_verified = TRUE
      `;

      const queryParams = [
        Array.isArray(skills) ? skills : [skills].filter(Boolean),
        Array.isArray(skkniCodes) ? skkniCodes : [skkniCodes].filter(Boolean),
        aqrfLevel ? parseInt(aqrfLevel) : 0
      ];
      let paramIndex = 4;

      if (location) {
        queryText += ` AND (tp.city ILIKE $${paramIndex} OR tp.province ILIKE $${paramIndex})`;
        queryParams.push(`%${location}%`);
        paramIndex++;
      }

      if (hasCertificates === 'true') {
        queryText += ` AND EXISTS (SELECT 1 FROM sertifikat WHERE talenta_id = tp.profile_id AND status = 'ACTIVE')`;
      }

      queryText += ` GROUP BY tp.profile_id, u.full_name, u.email, tp.city, tp.province, tp.skills, tp.aqrf_level`;
      queryText += ` HAVING COUNT(DISTINCT s.sertifikat_id) > 0 OR $${paramIndex}::text[] = ARRAY[]::text[]`;
      queryParams.push(Array.isArray(skkniCodes) ? skkniCodes : [skkniCodes].filter(Boolean));
      paramIndex++;

      queryText += ` ORDER BY match_score DESC, certificate_count DESC`;
      queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(parseInt(limit), offset);

      const result = await pool.query(queryText, queryParams);

      // Get total count
      const countQuery = `
        SELECT COUNT(DISTINCT tp.profile_id) as total
        FROM talenta_profiles tp
        JOIN users u ON tp.user_id = u.user_id
        LEFT JOIN sertifikat s ON tp.profile_id = s.talenta_id AND s.status = 'ACTIVE'
        WHERE u.status IN ('VERIFIED', 'ACTIVE')
          AND tp.ekyc_verified = TRUE
        ${location ? `AND (tp.city ILIKE '%${location}%' OR tp.province ILIKE '%${location}%')` : ''}
        ${hasCertificates === 'true' ? `AND EXISTS (SELECT 1 FROM sertifikat WHERE talenta_id = tp.profile_id AND status = 'ACTIVE')` : ''}
      `;
      const countResult = await pool.query(countQuery);
      const total = parseInt(countResult.rows[0].total);

      // Log PII access for each talent viewed
      result.rows.forEach(talent => {
        auditPIIAccess.logPIIAccess({
          userId: req.user.userId,
          action: 'SEARCH_TALENT',
          resourceType: 'TALENT_PROFILE',
          resourceId: talent.talenta_id,
          piiType: 'TALENT_PROFILE',
          purpose: 'TALENT_SEARCH',
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          metadata: {
            searchCriteria: { skills, skkniCodes, aqrfLevel, location }
          }
        });
      });

      res.json({
        success: true,
        data: {
          talents: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Search talent error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search talent',
        error: error.message
      });
    }
  }
);

/**
 * POST /api/v1/industri/job-postings
 * Create job posting
 * Flow Chart Node: [59]
 */
router.post(
  '/job-postings',
  [
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('jobType').isIn(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
    body('location').trim().notEmpty(),
    body('city').trim().notEmpty(),
    body('province').trim().notEmpty(),
    body('salaryMin').isInt({ min: 0 }),
    body('salaryMax').isInt({ min: 0 }),
    body('requirements').isObject(),
  ],
  auditPIIAccess({ resourceType: 'JOB_POSTING', piiTypes: [] }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        title,
        description,
        jobType,
        location,
        city,
        province,
        salaryMin,
        salaryMax,
        requirements
      } = req.body;

      const industriResult = await pool.query(
        'SELECT profile_id FROM industri_profiles WHERE user_id = $1',
        [req.user.userId]
      );

      if (industriResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Industri profile not found'
        });
      }

      const industriId = industriResult.rows[0].profile_id;

      const result = await pool.query(
        `INSERT INTO lowongan (
          industri_id, title, description, job_type, location, city, province,
          salary_min, salary_max, requirements, status, visible_to_talenta, published_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PUBLISHED', TRUE, CURRENT_TIMESTAMP)
        RETURNING lowongan_id, title, created_at`,
        [
          industriId,
          title,
          description,
          jobType,
          location,
          city,
          province,
          salaryMin,
          salaryMax,
          JSON.stringify(requirements)
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Job posting created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Create job posting error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create job posting',
        error: error.message
      });
    }
  }
);

/**
 * GET /api/v1/industri/job-postings
 * Get all job postings for this Industri
 */
router.get(
  '/job-postings',
  auditPIIAccess({ resourceType: 'JOB_POSTING', piiTypes: [] }),
  async (req, res) => {
    try {
      const industriResult = await pool.query(
        'SELECT profile_id FROM industri_profiles WHERE user_id = $1',
        [req.user.userId]
      );

      if (industriResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Industri profile not found'
        });
      }

      const industriId = industriResult.rows[0].profile_id;

      const result = await pool.query(
        `SELECT 
          l.lowongan_id,
          l.title,
          l.description,
          l.job_type,
          l.location,
          l.city,
          l.province,
          l.salary_min,
          l.salary_max,
          l.status,
          l.created_at,
          l.published_at,
          COUNT(DISTINCT p.pelamar_id) as application_count,
          COUNT(DISTINCT CASE WHEN p.status = 'PENDING' THEN p.pelamar_id END) as pending_count,
          COUNT(DISTINCT CASE WHEN p.hiring_decision = 'ACCEPT' THEN p.pelamar_id END) as accepted_count
        FROM lowongan l
        LEFT JOIN pelamar p ON l.lowongan_id = p.lowongan_id
        WHERE l.industri_id = $1
        GROUP BY l.lowongan_id
        ORDER BY l.created_at DESC`,
        [industriId]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get job postings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch job postings',
        error: error.message
      });
    }
  }
);

/**
 * GET /api/v1/industri/job-postings/:id/applicants
 * Get applicants for a job posting
 */
router.get(
  '/job-postings/:id/applicants',
  auditPIIAccess({ resourceType: 'JOB_APPLICATION', piiTypes: ['APPLICATION_DATA'] }),
  async (req, res) => {
    try {
      const { id: jobId } = req.params;

      const industriResult = await pool.query(
        'SELECT profile_id FROM industri_profiles WHERE user_id = $1',
        [req.user.userId]
      );

      if (industriResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Industri profile not found'
        });
      }

      const industriId = industriResult.rows[0].profile_id;

      // Verify job belongs to this industri
      const jobResult = await pool.query(
        'SELECT lowongan_id FROM lowongan WHERE lowongan_id = $1 AND industri_id = $2',
        [jobId, industriId]
      );

      if (jobResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Job posting not found'
        });
      }

      const applicantsResult = await pool.query(
        `SELECT 
          p.pelamar_id,
          p.applied_at,
          p.status,
          p.cover_letter,
          p.hiring_decision,
          p.hiring_decision_notes,
          p.saved_to_talent_pool,
          u.full_name,
          u.email,
          tp.profile_id as talenta_id,
          tp.city,
          tp.province,
          tp.skills,
          tp.aqrf_level,
          COUNT(DISTINCT s.sertifikat_id) as certificate_count
        FROM pelamar p
        JOIN talenta_profiles tp ON p.talenta_id = tp.profile_id
        JOIN users u ON tp.user_id = u.user_id
        LEFT JOIN sertifikat s ON tp.profile_id = s.talenta_id AND s.status = 'ACTIVE'
        WHERE p.lowongan_id = $1
        GROUP BY p.pelamar_id, u.full_name, u.email, tp.profile_id, tp.city, tp.province, tp.skills, tp.aqrf_level
        ORDER BY p.applied_at DESC`,
        [jobId]
      );

      res.json({
        success: true,
        data: applicantsResult.rows
      });
    } catch (error) {
      console.error('Get applicants error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applicants',
        error: error.message
      });
    }
  }
);

/**
 * POST /api/v1/industri/applications/:id/decision
 * Make hiring decision
 * Flow Chart Node: [53]
 */
router.post(
  '/applications/:id/decision',
  [
    body('decision').isIn(['ACCEPT', 'REJECT']),
    body('notes').optional().isString(),
    body('saveToTalentPool').optional().isBoolean(),
  ],
  auditPIIAccess({ resourceType: 'HIRING_DECISION', piiTypes: ['HIRING_DATA'] }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id: applicationId } = req.params;
      const { decision, notes, saveToTalentPool } = req.body;

      const industriResult = await pool.query(
        'SELECT profile_id FROM industri_profiles WHERE user_id = $1',
        [req.user.userId]
      );

      if (industriResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Industri profile not found'
        });
      }

      const industriId = industriResult.rows[0].profile_id;

      // Verify application belongs to this industri's job
      const appResult = await pool.query(
        `SELECT p.pelamar_id, p.lowongan_id, p.talenta_id, l.industri_id
         FROM pelamar p
         JOIN lowongan l ON p.lowongan_id = l.lowongan_id
         WHERE p.pelamar_id = $1`,
        [applicationId]
      );

      if (appResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      if (appResult.rows[0].industri_id !== industriId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Update application
      await pool.query(
        `UPDATE pelamar 
         SET hiring_decision = $1,
             hiring_decision_notes = $2,
             hiring_decision_at = CURRENT_TIMESTAMP,
             saved_to_talent_pool = $3,
             status = CASE WHEN $1 = 'ACCEPT' THEN 'ACCEPTED' ELSE 'REJECTED' END
         WHERE pelamar_id = $4`,
        [decision, notes || null, saveToTalentPool || false, applicationId]
      );

      res.json({
        success: true,
        message: `Application ${decision.toLowerCase()}ed successfully`
      });
    } catch (error) {
      console.error('Hiring decision error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update hiring decision',
        error: error.message
      });
    }
  }
);

/**
 * GET /api/v1/industri/talenta/:talentaId
 * Get detailed talent profile
 */
router.get(
  '/talenta/:talentaId',
  auditPIIAccess({ resourceType: 'TALENT_PROFILE', piiTypes: ['TALENT_PROFILE', 'CERTIFICATE'] }),
  async (req, res) => {
    try {
      const { talentaId } = req.params;

      // Get talent profile
      const talentResult = await pool.query(
        `SELECT 
          tp.*,
          u.email,
          u.full_name,
          u.status as user_status
        FROM talenta_profiles tp
        JOIN users u ON tp.user_id = u.user_id
        WHERE tp.profile_id = $1`,
        [talentaId]
      );

      if (talentResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Talent not found'
        });
      }

      // Get certificates
      const certificatesResult = await pool.query(
        `SELECT 
          s.sertifikat_id,
          s.certificate_number,
          s.title,
          s.issued_date,
          s.skkni_code,
          s.aqrf_level,
          s.status,
          k.title as course_title,
          mp.organization_name as issuer_name
        FROM sertifikat s
        LEFT JOIN kursus k ON s.kursus_id = k.kursus_id
        LEFT JOIN mitra_profiles mp ON s.mitra_id = mp.profile_id
        WHERE s.talenta_id = $1 AND s.status = 'ACTIVE'
        ORDER BY s.issued_date DESC`,
        [talentaId]
      );

      // Log PII access
      const { logPIIAccess } = require('../middleware/uu-pdp-audit');
      await logPIIAccess({
        userId: req.user.userId,
        action: 'VIEW_TALENT_PROFILE',
        resourceType: 'TALENT_PROFILE',
        resourceId: talentaId,
        piiType: 'TALENT_PROFILE',
        purpose: 'TALENT_EVALUATION',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json({
        success: true,
        data: {
          profile: talentResult.rows[0],
          certificates: certificatesResult.rows
        }
      });
    } catch (error) {
      console.error('Get talent profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get talent profile',
        error: error.message
      });
    }
  }
);

module.exports = router;


