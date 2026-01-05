/**
 * Talenta (Learner) API Routes
 * Flow Chart Nodes: [30, 37, 63, 62]
 */

const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const { authenticate, requireUserType } = require('../middleware/auth');
const { auditPIIAccess } = require('../middleware/uu-pdp-audit');
const { pool } = require('../config/database');

// Apply authentication to all routes
router.use(authenticate);
router.use(requireUserType('TALENTA'));

/**
 * GET /api/v1/talenta/learning-hub
 * Fetch available courses
 * Flow Chart Nodes: [30, 37]
 */
router.get(
  '/learning-hub',
  [
    query('search').optional().isString(),
    query('skkniCode').optional().isString(),
    query('aqrfLevel').optional().isInt({ min: 1, max: 8 }),
    query('provider').optional().isUUID(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  auditPIIAccess({ resourceType: 'COURSE', piiTypes: [] }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        search,
        skkniCode,
        aqrfLevel,
        provider,
        page = 1,
        limit = 20
      } = req.query;

      const offset = (page - 1) * limit;

      // Build query
      let queryText = `
        SELECT 
          k.kursus_id,
          k.title,
          k.title_en,
          k.description,
          k.duration_hours,
          k.duration_days,
          k.price,
          k.skkni_code,
          k.aqrf_level,
          k.status,
          mp.organization_name as provider_name,
          mp.profile_id as provider_id,
          COUNT(m.materi_id) as material_count,
          CASE WHEN e.enrollment_id IS NOT NULL THEN TRUE ELSE FALSE END as is_enrolled
        FROM kursus k
        JOIN mitra_profiles mp ON k.mitra_id = mp.profile_id
        LEFT JOIN materi m ON k.kursus_id = m.kursus_id AND m.status = 'ACTIVE'
        LEFT JOIN enrollments e ON k.kursus_id = e.kursus_id 
          AND e.talenta_id = (SELECT profile_id FROM talenta_profiles WHERE user_id = $1)
        WHERE k.status = 'PUBLISHED'
      `;

      const queryParams = [req.user.userId];
      let paramIndex = 2;

      if (search) {
        queryText += ` AND (k.title ILIKE $${paramIndex} OR k.description ILIKE $${paramIndex})`;
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      if (skkniCode) {
        queryText += ` AND k.skkni_code = $${paramIndex}`;
        queryParams.push(skkniCode);
        paramIndex++;
      }

      if (aqrfLevel) {
        queryText += ` AND k.aqrf_level = $${paramIndex}`;
        queryParams.push(parseInt(aqrfLevel));
        paramIndex++;
      }

      if (provider) {
        queryText += ` AND mp.profile_id = $${paramIndex}`;
        queryParams.push(provider);
        paramIndex++;
      }

      queryText += ` GROUP BY k.kursus_id, mp.organization_name, mp.profile_id, e.enrollment_id`;
      queryText += ` ORDER BY k.created_at DESC`;
      queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(parseInt(limit), offset);

      const result = await pool.query(queryText, queryParams);

      // Get total count
      const countQuery = `
        SELECT COUNT(DISTINCT k.kursus_id) as total
        FROM kursus k
        JOIN mitra_profiles mp ON k.mitra_id = mp.profile_id
        WHERE k.status = 'PUBLISHED'
        ${search ? `AND (k.title ILIKE '%${search}%' OR k.description ILIKE '%${search}%')` : ''}
        ${skkniCode ? `AND k.skkni_code = '${skkniCode}'` : ''}
        ${aqrfLevel ? `AND k.aqrf_level = ${aqrfLevel}` : ''}
        ${provider ? `AND mp.profile_id = '${provider}'` : ''}
      `;
      const countResult = await pool.query(countQuery);
      const total = parseInt(countResult.rows[0].total);

      res.json({
        success: true,
        data: {
          courses: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get courses error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch courses',
        error: error.message
      });
    }
  }
);

/**
 * POST /api/v1/talenta/apply
 * Apply for job (Apply Pekerjaan)
 * Flow Chart Node: [63]
 * Checks if Talenta has required Sertifikat [62]
 */
router.post(
  '/apply',
  [
    body('lowonganId').isUUID(),
    body('coverLetter').optional().isString(),
  ],
  auditPIIAccess({ resourceType: 'JOB_APPLICATION', piiTypes: ['APPLICATION_DATA'] }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { lowonganId, coverLetter } = req.body;

      // Get Talenta profile
      const talentaResult = await pool.query(
        'SELECT profile_id FROM talenta_profiles WHERE user_id = $1',
        [req.user.userId]
      );

      if (talentaResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Talenta profile not found'
        });
      }

      const talentaId = talentaResult.rows[0].profile_id;

      // Get job posting
      const jobResult = await pool.query(
        'SELECT * FROM lowongan WHERE lowongan_id = $1 AND status = $2',
        [lowonganId, 'PUBLISHED']
      );

      if (jobResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Job posting not found or not available'
        });
      }

      const job = jobResult.rows[0];

      // Check if already applied
      const existingApplication = await pool.query(
        'SELECT pelamar_id FROM pelamar WHERE lowongan_id = $1 AND talenta_id = $2',
        [lowonganId, talentaId]
      );

      if (existingApplication.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Already applied for this job'
        });
      }

      // Check eligibility: Verify required certificates (Flow Chart Node: [62])
      const requirements = job.requirements;
      let eligibilityResult = {
        eligible: true,
        missingRequirements: []
      };

      if (requirements.certificates && requirements.certificates.length > 0) {
        // Get user's certificates
        const certificatesResult = await pool.query(
          `SELECT sertifikat_id, skkni_code, aqrf_level, status
           FROM sertifikat
           WHERE talenta_id = $1 AND status = 'ACTIVE'`,
          [talentaId]
        );

        const userCertificates = certificatesResult.rows;
        const userCertIds = userCertificates.map(c => c.sertifikat_id);
        const userSkkniCodes = userCertificates.map(c => c.skkni_code).filter(Boolean);

        // Check required certificates
        for (const requiredCert of requirements.certificates) {
          // Check by certificate ID or SKKNI code
          const hasCert = userCertIds.includes(requiredCert) || 
                         userSkkniCodes.includes(requiredCert);
          
          if (!hasCert) {
            eligibilityResult.eligible = false;
            eligibilityResult.missingRequirements.push({
              type: 'CERTIFICATE',
              requirement: requiredCert
            });
          }
        }
      }

      // Check AQRF level
      if (requirements.aqrfLevel) {
        const maxAQRF = Math.max(...userCertificates.map(c => c.aqrf_level || 0), 0);
        if (maxAQRF < requirements.aqrfLevel) {
          eligibilityResult.eligible = false;
          eligibilityResult.missingRequirements.push({
            type: 'AQRF_LEVEL',
            required: requirements.aqrfLevel,
            current: maxAQRF
          });
        }
      }

      // Check skills
      if (requirements.skills && requirements.skills.length > 0) {
        const talentaProfile = await pool.query(
          'SELECT skills FROM talenta_profiles WHERE profile_id = $1',
          [talentaId]
        );

        const userSkills = talentaProfile.rows[0]?.skills || [];
        const userSkillNames = userSkills.map(s => s.name?.toLowerCase() || '');

        for (const requiredSkill of requirements.skills) {
          if (!userSkillNames.includes(requiredSkill.toLowerCase())) {
            eligibilityResult.missingRequirements.push({
              type: 'SKILL',
              requirement: requiredSkill
            });
            // Skills are not blocking, just noted
          }
        }
      }

      if (!eligibilityResult.eligible) {
        return res.status(400).json({
          success: false,
          message: 'Application requirements not met',
          eligibility: eligibilityResult
        });
      }

      // Get relevant certificates to attach
      const relevantCertificates = await pool.query(
        `SELECT sertifikat_id FROM sertifikat
         WHERE talenta_id = $1 
         AND status = 'ACTIVE'
         AND (
           skkni_code = ANY($2::text[]) 
           OR aqrf_level >= $3
         )`,
        [
          talentaId,
          requirements.skkniCodes || [],
          requirements.aqrfLevel || 0
        ]
      );

      // Create application (Flow Chart Node: [63])
      const applicationResult = await pool.query(
        `INSERT INTO pelamar (
          lowongan_id, talenta_id, applied_at, status,
          cover_letter, attached_certificates
        ) VALUES ($1, $2, CURRENT_TIMESTAMP, 'PENDING', $3, $4)
        RETURNING pelamar_id, applied_at, status`,
        [
          lowonganId,
          talentaId,
          coverLetter || null,
          relevantCertificates.rows.map(c => c.sertifikat_id)
        ]
      );

      const application = applicationResult.rows[0];

      // Send notification to employer
      // await notificationService.send({
      //   userId: job.industri_id,
      //   type: 'new_application',
      //   title: 'New Job Application',
      //   message: `${req.user.fullName} applied for ${job.title}`
      // });

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: {
          applicationId: application.pelamar_id,
          appliedAt: application.applied_at,
          status: application.status,
          eligibility: eligibilityResult
        }
      });
    } catch (error) {
      console.error('Job application error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit application',
        error: error.message
      });
    }
  }
);

/**
 * GET /api/v1/talenta/applications
 * Get my job applications
 */
router.get(
  '/applications',
  auditPIIAccess({ resourceType: 'JOB_APPLICATION', piiTypes: ['APPLICATION_DATA'] }),
  async (req, res) => {
    try {
      const talentaResult = await pool.query(
        'SELECT profile_id FROM talenta_profiles WHERE user_id = $1',
        [req.user.userId]
      );

      if (talentaResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Talenta profile not found'
        });
      }

      const talentaId = talentaResult.rows[0].profile_id;

      const result = await pool.query(
        `SELECT 
          p.pelamar_id,
          p.applied_at,
          p.status,
          p.cover_letter,
          p.hiring_decision,
          p.hiring_decision_notes,
          l.lowongan_id,
          l.title as job_title,
          l.description as job_description,
          l.job_type,
          l.location,
          l.city,
          l.province,
          l.salary_min,
          l.salary_max,
          ip.company_name,
          ip.profile_id as industri_id
        FROM pelamar p
        JOIN lowongan l ON p.lowongan_id = l.lowongan_id
        JOIN industri_profiles ip ON l.industri_id = ip.profile_id
        WHERE p.talenta_id = $1
        ORDER BY p.applied_at DESC`,
        [talentaId]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applications',
        error: error.message
      });
    }
  }
);

/**
 * GET /api/v1/talenta/certificates
 * Get user's certificates
 */
router.get(
  '/certificates',
  auditPIIAccess({ resourceType: 'CERTIFICATE', piiTypes: ['CERTIFICATE_DATA'] }),
  async (req, res) => {
    try {
      const talentaResult = await pool.query(
        'SELECT profile_id FROM talenta_profiles WHERE user_id = $1',
        [req.user.userId]
      );

      if (talentaResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Talenta profile not found'
        });
      }

      const talentaId = talentaResult.rows[0].profile_id;

      const certificatesResult = await pool.query(
        `SELECT 
          s.sertifikat_id,
          s.certificate_number,
          s.credential_id,
          s.title,
          s.issued_date,
          s.expiration_date,
          s.skkni_code,
          s.aqrf_level,
          s.status,
          k.title as course_title,
          mp.organization_name as issuer_name
        FROM sertifikat s
        LEFT JOIN kursus k ON s.kursus_id = k.kursus_id
        LEFT JOIN mitra_profiles mp ON s.mitra_id = mp.profile_id
        WHERE s.talenta_id = $1
        ORDER BY s.issued_date DESC`,
        [talentaId]
      );

      res.json({
        success: true,
        data: certificatesResult.rows
      });
    } catch (error) {
      console.error('Get certificates error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch certificates',
        error: error.message
      });
    }
  }
);

/**
 * POST /api/v1/talenta/enroll
 * Enroll in a course
 * Flow Chart Node: [37]
 */
router.post(
  '/enroll',
  [
    body('kursusId').isUUID(),
  ],
  auditPIIAccess({ resourceType: 'ENROLLMENT', piiTypes: ['ENROLLMENT_DATA'] }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { kursusId } = req.body;

      // Get Talenta profile
      const talentaResult = await pool.query(
        'SELECT profile_id FROM talenta_profiles WHERE user_id = $1',
        [req.user.userId]
      );

      if (talentaResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Talenta profile not found'
        });
      }

      const talentaId = talentaResult.rows[0].profile_id;

      // Check if course exists and is published
      const courseResult = await pool.query(
        'SELECT * FROM kursus WHERE kursus_id = $1 AND status = $2',
        [kursusId, 'PUBLISHED']
      );

      if (courseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Course not found or not available'
        });
      }

      const course = courseResult.rows[0];

      // Check if already enrolled
      const existingEnrollment = await pool.query(
        'SELECT enrollment_id FROM enrollments WHERE kursus_id = $1 AND talenta_id = $2',
        [kursusId, talentaId]
      );

      if (existingEnrollment.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Already enrolled in this course'
        });
      }

      // Check prerequisites if any
      if (course.prerequisites) {
        const prerequisites = JSON.parse(course.prerequisites);
        if (prerequisites.certificates && prerequisites.certificates.length > 0) {
          const userCerts = await pool.query(
            `SELECT sertifikat_id, skkni_code FROM sertifikat 
             WHERE talenta_id = $1 AND status = 'ACTIVE'`,
            [talentaId]
          );
          
          const userCertIds = userCerts.rows.map(c => c.sertifikat_id);
          const userSkkniCodes = userCerts.rows.map(c => c.skkni_code).filter(Boolean);
          
          for (const reqCert of prerequisites.certificates) {
            if (!userCertIds.includes(reqCert) && !userSkkniCodes.includes(reqCert)) {
              return res.status(400).json({
                success: false,
                message: 'Prerequisites not met',
                missingPrerequisites: [reqCert]
              });
            }
          }
        }
      }

      // Create enrollment
      const enrollmentResult = await pool.query(
        `INSERT INTO enrollments (kursus_id, talenta_id, status, payment_status)
         VALUES ($1, $2, 'ACTIVE', $3)
         RETURNING enrollment_id, enrolled_at, status`,
        [kursusId, talentaId, course.price > 0 ? 'PENDING' : 'PAID']
      );

      res.status(201).json({
        success: true,
        message: 'Successfully enrolled in course',
        data: enrollmentResult.rows[0]
      });
    } catch (error) {
      console.error('Enrollment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to enroll in course',
        error: error.message
      });
    }
  }
);

/**
 * GET /api/v1/talenta/my-courses
 * Get enrolled courses
 */
router.get(
  '/my-courses',
  auditPIIAccess({ resourceType: 'ENROLLMENT', piiTypes: ['ENROLLMENT_DATA'] }),
  async (req, res) => {
    try {
      const talentaResult = await pool.query(
        'SELECT profile_id FROM talenta_profiles WHERE user_id = $1',
        [req.user.userId]
      );

      if (talentaResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Talenta profile not found'
        });
      }

      const talentaId = talentaResult.rows[0].profile_id;

      const result = await pool.query(
        `SELECT 
          e.enrollment_id,
          e.enrolled_at,
          e.status,
          e.progress,
          e.completed_at,
          e.certificate_issued,
          k.kursus_id,
          k.title,
          k.description,
          k.duration_hours,
          k.skkni_code,
          k.aqrf_level,
          mp.organization_name as provider_name
        FROM enrollments e
        JOIN kursus k ON e.kursus_id = k.kursus_id
        JOIN mitra_profiles mp ON k.mitra_id = mp.profile_id
        WHERE e.talenta_id = $1
        ORDER BY e.enrolled_at DESC`,
        [talentaId]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get my courses error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch enrolled courses',
        error: error.message
      });
    }
  }
);

/**
 * GET /api/v1/talenta/workshops
 * Browse available workshops
 */
router.get(
  '/workshops',
  [
    query('search').optional().isString(),
    query('location').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  auditPIIAccess({ resourceType: 'WORKSHOP', piiTypes: [] }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        search,
        location,
        page = 1,
        limit = 20
      } = req.query;

      const offset = (page - 1) * limit;

      let queryText = `
        SELECT 
          w.workshop_id,
          w.title,
          w.description,
          w.start_date,
          w.end_date,
          w.start_time,
          w.end_time,
          w.location_name,
          w.city,
          w.province,
          w.latitude,
          w.longitude,
          w.capacity,
          w.price,
          w.status,
          w.attendance_method,
          mp.organization_name as provider_name,
          k.title as course_title,
          (SELECT COUNT(*) FROM workshop_registrations wr 
           WHERE wr.workshop_id = w.workshop_id AND wr.status = 'CONFIRMED') as registered_count
        FROM workshop w
        JOIN mitra_profiles mp ON w.mitra_id = mp.profile_id
        LEFT JOIN kursus k ON w.kursus_id = k.kursus_id
        WHERE w.status IN ('OPEN', 'IN_PROGRESS')
      `;

      const queryParams = [];
      let paramIndex = 1;

      if (search) {
        queryText += ` AND (w.title ILIKE $${paramIndex} OR w.description ILIKE $${paramIndex})`;
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      if (location) {
        queryText += ` AND (w.city ILIKE $${paramIndex} OR w.province ILIKE $${paramIndex})`;
        queryParams.push(`%${location}%`);
        paramIndex++;
      }

      queryText += ` ORDER BY w.start_date ASC`;
      queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(parseInt(limit), offset);

      const result = await pool.query(queryText, queryParams);

      res.json({
        success: true,
        data: {
          workshops: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: result.rows.length
          }
        }
      });
    } catch (error) {
      console.error('Get workshops error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch workshops',
        error: error.message
      });
    }
  }
);

/**
 * POST /api/v1/talenta/workshops/:id/register
 * Register for workshop
 */
router.post(
  '/workshops/:id/register',
  [
    body('latitude').optional().isFloat(),
    body('longitude').optional().isFloat(),
  ],
  auditPIIAccess({ resourceType: 'WORKSHOP_REGISTRATION', piiTypes: ['REGISTRATION_DATA'] }),
  async (req, res) => {
    try {
      const { id: workshopId } = req.params;
      const { latitude, longitude } = req.body;

      const talentaResult = await pool.query(
        'SELECT profile_id FROM talenta_profiles WHERE user_id = $1',
        [req.user.userId]
      );

      if (talentaResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Talenta profile not found'
        });
      }

      const talentaId = talentaResult.rows[0].profile_id;

      // Check workshop exists and is open
      const workshopResult = await pool.query(
        'SELECT * FROM workshop WHERE workshop_id = $1 AND status = $2',
        [workshopId, 'OPEN']
      );

      if (workshopResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Workshop not found or registration closed'
        });
      }

      const workshop = workshopResult.rows[0];

      // Check capacity
      const registeredCount = await pool.query(
        `SELECT COUNT(*) FROM workshop_registrations 
         WHERE workshop_id = $1 AND status = 'CONFIRMED'`,
        [workshopId]
      );

      if (parseInt(registeredCount.rows[0].count) >= workshop.capacity) {
        return res.status(409).json({
          success: false,
          message: 'Workshop is full'
        });
      }

      // Check if already registered
      const existingReg = await pool.query(
        'SELECT registration_id FROM workshop_registrations WHERE workshop_id = $1 AND talenta_id = $2',
        [workshopId, talentaId]
      );

      if (existingReg.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Already registered for this workshop'
        });
      }

      // Create registration
      const regResult = await pool.query(
        `INSERT INTO workshop_registrations (workshop_id, talenta_id, status, payment_status)
         VALUES ($1, $2, 'CONFIRMED', $3)
         RETURNING registration_id, registered_at, status`,
        [workshopId, talentaId, workshop.price > 0 ? 'PENDING' : 'PAID']
      );

      res.status(201).json({
        success: true,
        message: 'Successfully registered for workshop',
        data: regResult.rows[0]
      });
    } catch (error) {
      console.error('Workshop registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register for workshop',
        error: error.message
      });
    }
  }
);

/**
 * POST /api/v1/talenta/workshops/:id/attendance
 * Record workshop attendance with GPS
 * Flow Chart Node: [47]
 */
router.post(
  '/workshops/:id/attendance',
  [
    body('sessionId').isUUID(),
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 }),
    body('timestamp').optional().isISO8601(),
  ],
  auditPIIAccess({ resourceType: 'WORKSHOP_ATTENDANCE', piiTypes: ['ATTENDANCE_DATA', 'LOCATION_DATA'] }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id: workshopId } = req.params;
      const { sessionId, latitude, longitude, timestamp } = req.body;

      const talentaResult = await pool.query(
        'SELECT profile_id FROM talenta_profiles WHERE user_id = $1',
        [req.user.userId]
      );

      if (talentaResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Talenta profile not found'
        });
      }

      const talentaId = talentaResult.rows[0].profile_id;

      // Verify registration
      const regResult = await pool.query(
        `SELECT registration_id FROM workshop_registrations 
         WHERE workshop_id = $1 AND talenta_id = $2 AND status = 'CONFIRMED'`,
        [workshopId, talentaId]
      );

      if (regResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Not registered for this workshop'
        });
      }

      const registrationId = regResult.rows[0].registration_id;

      // Get workshop location for geofence check
      const workshopResult = await pool.query(
        'SELECT latitude, longitude, geofence_radius FROM workshop WHERE workshop_id = $1',
        [workshopId]
      );

      if (workshopResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Workshop not found'
        });
      }

      const workshop = workshopResult.rows[0];

      // Verify GPS location (geofence check)
      if (workshop.latitude && workshop.longitude) {
        const distance = calculateDistance(
          latitude,
          longitude,
          parseFloat(workshop.latitude),
          parseFloat(workshop.longitude)
        );
        const radius = workshop.geofence_radius || 100; // meters

        if (distance > radius) {
          return res.status(400).json({
            success: false,
            message: 'Location verification failed. You must be at the workshop location.',
            distance: distance,
            requiredRadius: radius
          });
        }
      }

      // Check if already marked present
      const existingAttendance = await pool.query(
        `SELECT attendance_id FROM workshop_attendance 
         WHERE session_id = $1 AND registration_id = $2`,
        [sessionId, registrationId]
      );

      if (existingAttendance.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Attendance already recorded'
        });
      }

      // Record attendance
      const attendanceResult = await pool.query(
        `INSERT INTO workshop_attendance (
          session_id, registration_id, attendance_method,
          latitude, longitude, attendance_timestamp, verified
        ) VALUES ($1, $2, 'GPS', $3, $4, $5, TRUE)
        RETURNING attendance_id, attendance_timestamp, verified`,
        [
          sessionId,
          registrationId,
          latitude,
          longitude,
          timestamp || new Date()
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Attendance recorded successfully',
        data: attendanceResult.rows[0]
      });
    } catch (error) {
      console.error('Attendance recording error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record attendance',
        error: error.message
      });
    }
  }
);

// Helper function to calculate distance between two GPS coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in meters
}

module.exports = router;


