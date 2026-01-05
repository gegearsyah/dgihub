/**
 * Public Certificate Verification Routes
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

/**
 * GET /api/v1/certificates/verify/:certificateId
 * Public certificate verification endpoint
 */
router.get('/verify/:certificateId', async (req, res) => {
  try {
    const { certificateId } = req.params;

    const result = await pool.query(
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
        u.full_name as recipient_name,
        mp.organization_name as issuer_name,
        k.title as course_title
      FROM sertifikat s
      JOIN talenta_profiles tp ON s.talenta_id = tp.profile_id
      JOIN users u ON tp.user_id = u.user_id
      LEFT JOIN mitra_profiles mp ON s.mitra_id = mp.profile_id
      LEFT JOIN kursus k ON s.kursus_id = k.kursus_id
      WHERE s.sertifikat_id = $1 OR s.certificate_number = $1`,
      [certificateId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    const certificate = result.rows[0];

    res.json({
      success: true,
      data: certificate
    });
  } catch (error) {
    console.error('Certificate verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify certificate',
      error: error.message
    });
  }
});

module.exports = router;



