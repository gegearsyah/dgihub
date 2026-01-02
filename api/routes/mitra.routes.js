/**
 * Mitra (Training Partner) API Routes
 * Flow Chart Nodes: [27, 34, 45]
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate, requireUserType } = require('../middleware/auth');
const { auditPIIAccess } = require('../middleware/uu-pdp-audit');
const { pool } = require('../config/database');
const { certificateService } = require('../services/certificate');
const { s3Service } = require('../services/s3');
const { siplatihService } = require('../services/siplatih');

// Apply authentication to all routes
router.use(authenticate);
router.use(requireUserType('MITRA'));

/**
 * POST /api/v1/mitra/courses
 * Create course and upload material
 * Flow Chart Nodes: [27, 34]
 */
router.post(
  '/courses',
  [
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('durationHours').isInt({ min: 1 }),
    body('price').isFloat({ min: 0 }),
    body('skkniCode').optional().isString(),
    body('aqrfLevel').optional().isInt({ min: 1, max: 8 }),
  ],
  auditPIIAccess({ resourceType: 'COURSE', piiTypes: ['COURSE_DATA'] }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        title,
        titleEn,
        description,
        descriptionEn,
        durationHours,
        durationDays,
        price,
        skkniCode,
        aqrfLevel,
        prerequisites,
        learningOutcomes,
        materials
      } = req.body;

      // Get Mitra profile
      const mitraResult = await pool.query(
        'SELECT profile_id FROM mitra_profiles WHERE user_id = $1',
        [req.user.userId]
      );

      if (mitraResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Mitra profile not found'
        });
      }

      const mitraId = mitraResult.rows[0].profile_id;

      // Start transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Create course (Flow Chart Node: [27])
        const courseResult = await client.query(
          `INSERT INTO kursus (
            mitra_id, title, title_en, description, description_en,
            duration_hours, duration_days, price, skkni_code, aqrf_level,
            prerequisites, learning_outcomes, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'DRAFT')
          RETURNING kursus_id, title, created_at`,
          [
            mitraId,
            title,
            titleEn || null,
            description,
            descriptionEn || null,
            durationHours,
            durationDays || null,
            price,
            skkniCode || null,
            aqrfLevel || null,
            prerequisites ? JSON.stringify(prerequisites) : null,
            learningOutcomes ? JSON.stringify(learningOutcomes) : null
          ]
        );

        const course = courseResult.rows[0];

        // Upload materials (Flow Chart Node: [34])
        if (materials && Array.isArray(materials) && materials.length > 0) {
          const materialPromises = materials.map(async (material) => {
            // Upload file to S3
            const uploadResult = await s3Service.upload(material.file, {
              bucket: 'dgihub-course-materials',
              key: `courses/${course.kursus_id}/${material.fileName}`
            });

            // Save material record
            await client.query(
              `INSERT INTO materi (
                kursus_id, title, description, material_type,
                file_url, file_size, file_type, order_index
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [
                course.kursus_id,
                material.title,
                material.description || null,
                material.type || 'DOCUMENT',
                uploadResult.url,
                material.fileSize,
                material.fileType,
                material.orderIndex || 0
              ]
            );
          });

          await Promise.all(materialPromises);
        }

        // Register with SIPLatih (optional)
        if (skkniCode) {
          try {
            await siplatihService.registerTrainingProgram({
              programCode: `LPK-${course.kursus_id}`,
              programName: title,
              skkniCode: skkniCode,
              durationDays: durationDays || Math.ceil(durationHours / 8),
              durationHours: durationHours
            });
            
            await client.query(
              'UPDATE kursus SET siplatih_registered = TRUE, siplatih_registered_at = CURRENT_TIMESTAMP WHERE kursus_id = $1',
              [course.kursus_id]
            );
          } catch (siplatihError) {
            console.warn('SIPLatih registration failed:', siplatihError);
            // Don't fail course creation if SIPLatih fails
          }
        }

        await client.query('COMMIT');

        res.status(201).json({
          success: true,
          message: 'Course created successfully',
          data: {
            courseId: course.kursus_id,
            title: course.title,
            createdAt: course.created_at
          }
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Course creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create course',
        error: error.message
      });
    }
  }
);

/**
 * POST /api/v1/mitra/issue-certificate
 * Issue certificate to Talenta
 * Flow Chart Node: [45]
 */
router.post(
  '/issue-certificate',
  [
    body('talentaId').isUUID(),
    body('kursusId').isUUID(),
    body('score').optional().isFloat({ min: 0, max: 100 }),
    body('grade').optional().isString(),
  ],
  auditPIIAccess({ resourceType: 'CERTIFICATE', piiTypes: ['CERTIFICATE_DATA'] }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { talentaId, kursusId, score, grade, level } = req.body;

      // Get Mitra profile
      const mitraResult = await pool.query(
        'SELECT profile_id FROM mitra_profiles WHERE user_id = $1',
        [req.user.userId]
      );

      if (mitraResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Mitra profile not found'
        });
      }

      const mitraId = mitraResult.rows[0].profile_id;

      // Get Talenta profile
      const talentaResult = await pool.query(
        'SELECT profile_id FROM talenta_profiles WHERE profile_id = $1',
        [talentaId]
      );

      if (talentaResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Talenta profile not found'
        });
      }

      // Get course
      const courseResult = await pool.query(
        'SELECT * FROM kursus WHERE kursus_id = $1 AND mitra_id = $2',
        [kursusId, mitraId]
      );

      if (courseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Course not found or access denied'
        });
      }

      const course = courseResult.rows[0];

      // Issue certificate (Flow Chart Node: [45])
      const certificate = await certificateService.issueCertificate({
        mitraId: mitraId,
        talentaId: talentaId,
        kursusId: kursusId,
        course: course,
        score: score,
        grade: grade,
        level: level
      });

      res.status(201).json({
        success: true,
        message: 'Certificate issued successfully',
        data: {
          certificateId: certificate.sertifikat_id,
          certificateNumber: certificate.certificate_number,
          credentialId: certificate.credential_id
        }
      });
    } catch (error) {
      console.error('Certificate issuance error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to issue certificate',
        error: error.message
      });
    }
  }
);

/**
 * GET /api/v1/mitra/courses
 * Get all courses for this Mitra
 */
router.get(
  '/courses',
  auditPIIAccess({ resourceType: 'COURSE', piiTypes: [] }),
  async (req, res) => {
    try {
      const mitraResult = await pool.query(
        'SELECT profile_id FROM mitra_profiles WHERE user_id = $1',
        [req.user.userId]
      );

      if (mitraResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Mitra profile not found'
        });
      }

      const mitraId = mitraResult.rows[0].profile_id;

      const result = await pool.query(
        `SELECT 
          k.kursus_id,
          k.title,
          k.description,
          k.status,
          k.price,
          k.skkni_code,
          k.aqrf_level,
          k.created_at,
          k.published_at,
          COUNT(DISTINCT e.enrollment_id) as enrollment_count,
          COUNT(DISTINCT m.materi_id) as material_count
        FROM kursus k
        LEFT JOIN enrollments e ON k.kursus_id = e.kursus_id
        LEFT JOIN materi m ON k.kursus_id = m.kursus_id AND m.status = 'ACTIVE'
        WHERE k.mitra_id = $1
        GROUP BY k.kursus_id
        ORDER BY k.created_at DESC`,
        [mitraId]
      );

      res.json({
        success: true,
        data: result.rows
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
 * GET /api/v1/mitra/courses/:courseId/participants
 * Get course participants
 */
router.get(
  '/courses/:courseId/participants',
  auditPIIAccess({ resourceType: 'PARTICIPANT', piiTypes: ['PARTICIPANT_DATA'] }),
  async (req, res) => {
    try {
      const { courseId } = req.params;

      // Verify course ownership
      const mitraResult = await pool.query(
        'SELECT profile_id FROM mitra_profiles WHERE user_id = $1',
        [req.user.userId]
      );

      const mitraId = mitraResult.rows[0].profile_id;

      const courseResult = await pool.query(
        'SELECT kursus_id FROM kursus WHERE kursus_id = $1 AND mitra_id = $2',
        [courseId, mitraId]
      );

      if (courseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Get participants (enrollments)
      const participantsResult = await pool.query(
        `SELECT 
          e.enrollment_id,
          tp.profile_id as talenta_id,
          u.full_name,
          u.email,
          e.enrolled_at,
          e.status,
          e.progress,
          s.sertifikat_id,
          s.certificate_number
        FROM enrollments e
        JOIN talenta_profiles tp ON e.talenta_id = tp.profile_id
        JOIN users u ON tp.user_id = u.user_id
        LEFT JOIN sertifikat s ON s.talenta_id = tp.profile_id AND s.kursus_id = $1
        WHERE e.kursus_id = $1
        ORDER BY e.enrolled_at DESC`,
        [courseId]
      );

      res.json({
        success: true,
        data: participantsResult.rows
      });
    } catch (error) {
      console.error('Get participants error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get participants',
        error: error.message
      });
    }
  }
);

/**
 * POST /api/v1/mitra/workshops
 * Create workshop
 * Flow Chart Node: [28]
 */
router.post(
  '/workshops',
  [
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('startTime').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
    body('endTime').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
    body('locationName').trim().notEmpty(),
    body('city').trim().notEmpty(),
    body('capacity').isInt({ min: 1 }),
    body('latitude').optional().isFloat(),
    body('longitude').optional().isFloat(),
  ],
  auditPIIAccess({ resourceType: 'WORKSHOP', piiTypes: ['WORKSHOP_DATA'] }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        title,
        description,
        kursusId,
        startDate,
        endDate,
        startTime,
        endTime,
        locationName,
        city,
        province,
        address,
        latitude,
        longitude,
        capacity,
        price,
        attendanceMethod,
        geofenceRadius
      } = req.body;

      const mitraResult = await pool.query(
        'SELECT profile_id FROM mitra_profiles WHERE user_id = $1',
        [req.user.userId]
      );

      if (mitraResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Mitra profile not found'
        });
      }

      const mitraId = mitraResult.rows[0].profile_id;

      const workshopResult = await pool.query(
        `INSERT INTO workshop (
          mitra_id, kursus_id, title, description,
          start_date, end_date, start_time, end_time,
          location_name, city, province, address,
          latitude, longitude, capacity, price,
          attendance_method, geofence_radius, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'DRAFT')
        RETURNING workshop_id, title, created_at`,
        [
          mitraId,
          kursusId || null,
          title,
          description,
          startDate,
          endDate,
          startTime,
          endTime,
          locationName,
          city,
          province || null,
          address || null,
          latitude || null,
          longitude || null,
          capacity,
          price || 0,
          attendanceMethod || 'GPS',
          geofenceRadius || 100
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Workshop created successfully',
        data: workshopResult.rows[0]
      });
    } catch (error) {
      console.error('Create workshop error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create workshop',
        error: error.message
      });
    }
  }
);

/**
 * GET /api/v1/mitra/workshops
 * Get all workshops for this Mitra
 */
router.get(
  '/workshops',
  auditPIIAccess({ resourceType: 'WORKSHOP', piiTypes: [] }),
  async (req, res) => {
    try {
      const mitraResult = await pool.query(
        'SELECT profile_id FROM mitra_profiles WHERE user_id = $1',
        [req.user.userId]
      );

      if (mitraResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Mitra profile not found'
        });
      }

      const mitraId = mitraResult.rows[0].profile_id;

      const result = await pool.query(
        `SELECT 
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
          w.capacity,
          w.price,
          w.status,
          w.created_at,
          COUNT(DISTINCT wr.registration_id) as registered_count,
          k.title as course_title
        FROM workshop w
        LEFT JOIN workshop_registrations wr ON w.workshop_id = wr.workshop_id AND wr.status = 'CONFIRMED'
        LEFT JOIN kursus k ON w.kursus_id = k.kursus_id
        WHERE w.mitra_id = $1
        GROUP BY w.workshop_id, k.title
        ORDER BY w.start_date DESC`,
        [mitraId]
      );

      res.json({
        success: true,
        data: result.rows
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
 * GET /api/v1/mitra/workshops/:id/attendance
 * Get workshop attendance
 * Flow Chart Node: [47]
 */
router.get(
  '/workshops/:id/attendance',
  auditPIIAccess({ resourceType: 'WORKSHOP_ATTENDANCE', piiTypes: ['ATTENDANCE_DATA'] }),
  async (req, res) => {
    try {
      const { id: workshopId } = req.params;

      const mitraResult = await pool.query(
        'SELECT profile_id FROM mitra_profiles WHERE user_id = $1',
        [req.user.userId]
      );

      if (mitraResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Mitra profile not found'
        });
      }

      const mitraId = mitraResult.rows[0].profile_id;

      // Verify workshop belongs to this mitra
      const workshopResult = await pool.query(
        'SELECT workshop_id FROM workshop WHERE workshop_id = $1 AND mitra_id = $2',
        [workshopId, mitraId]
      );

      if (workshopResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Workshop not found'
        });
      }

      const attendanceResult = await pool.query(
        `SELECT 
          wa.attendance_id,
          wa.attendance_timestamp,
          wa.latitude,
          wa.longitude,
          wa.attendance_method,
          wa.verified,
          ws.session_date,
          ws.start_time,
          ws.end_time,
          u.full_name,
          u.email,
          tp.profile_id as talenta_id
        FROM workshop_attendance wa
        JOIN workshop_sessions ws ON wa.session_id = ws.session_id
        JOIN workshop_registrations wr ON wa.registration_id = wr.registration_id
        JOIN talenta_profiles tp ON wr.talenta_id = tp.profile_id
        JOIN users u ON tp.user_id = u.user_id
        WHERE ws.workshop_id = $1
        ORDER BY wa.attendance_timestamp DESC`,
        [workshopId]
      );

      res.json({
        success: true,
        data: attendanceResult.rows
      });
    } catch (error) {
      console.error('Get attendance error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch attendance',
        error: error.message
      });
    }
  }
);

module.exports = router;


