/**
 * Certificate Service
 * Handles certificate issuance with Open Badges 3.0 format
 * Flow Chart Node: [45]
 */

const { pool } = require('../config/database');
const { hsmService } = require('./hsm');
const { v4: uuidv4 } = require('uuid');

class CertificateService {
  /**
   * Issue certificate to Talenta
   * @param {Object} certificateData - Certificate data
   * @returns {Promise<Object>} Issued certificate
   */
  async issueCertificate(certificateData) {
    const {
      mitraId,
      talentaId,
      kursusId,
      course,
      score,
      grade,
      level
    } = certificateData;

    try {
      // Generate certificate number
      const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const credentialId = `https://dgihub.go.id/credentials/badges/${uuidv4()}`;

      // Build Open Badges 3.0 JSON-LD credential
      const credentialJson = await this.buildOpenBadgesCredential({
        credentialId,
        certificateNumber,
        mitraId,
        talentaId,
        kursusId,
        course,
        score,
        grade,
        level
      });

      // Sign credential using HSM
      const proof = await hsmService.signCredential(credentialJson, mitraId);

      // Add proof to credential
      credentialJson.proof = proof;

      // Start transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Insert certificate
        const certificateResult = await client.query(
          `INSERT INTO sertifikat (
            mitra_id, talenta_id, kursus_id,
            certificate_number, credential_id, credential_json,
            title, description, issued_date,
            skkni_code, aqrf_level,
            score, grade, level,
            proof_type, proof_verification_method, proof_jws, proof_created,
            status, visible_to_industry, searchable
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
          RETURNING sertifikat_id, certificate_number, credential_id, issued_date`,
          [
            mitraId,
            talentaId,
            kursusId,
            certificateNumber,
            credentialId,
            JSON.stringify(credentialJson),
            course.title,
            course.description || null,
            new Date(),
            course.skkni_code || null,
            course.aqrf_level || null,
            score || null,
            grade || null,
            level || null,
            proof.type,
            proof.verificationMethod,
            proof.jws,
            proof.created,
            'ACTIVE',
            true, // visible_to_industry
            true  // searchable
          ]
        );

        const certificate = certificateResult.rows[0];

        // Update Talenta profile with certificate
        await client.query(
          `UPDATE talenta_profiles 
           SET aqrf_level = GREATEST(COALESCE(aqrf_level, 0), COALESCE($1, 0))
           WHERE profile_id = $2`,
          [course.aqrf_level || 0, talentaId]
        );

        await client.query('COMMIT');

        return certificate;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Certificate issuance error:', error);
      throw error;
    }
  }

  /**
   * Build Open Badges 3.0 JSON-LD credential
   */
  async buildOpenBadgesCredential(data) {
    const {
      credentialId,
      certificateNumber,
      mitraId,
      talentaId,
      kursusId,
      course,
      score,
      grade,
      level
    } = data;

    // Get issuer information
    const issuerResult = await pool.query(
      'SELECT organization_name FROM mitra_profiles WHERE profile_id = $1',
      [mitraId]
    );
    const issuerName = issuerResult.rows[0]?.organization_name || 'Unknown';

    // Get subject information
    const subjectResult = await pool.query(
      `SELECT tp.*, u.full_name 
       FROM talenta_profiles tp
       JOIN users u ON tp.user_id = u.user_id
       WHERE tp.profile_id = $1`,
      [talentaId]
    );
    const subject = subjectResult.rows[0];

    const credential = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json",
        "https://dgihub.go.id/contexts/vocational-badge/v1"
      ],
      "type": ["VerifiableCredential", "OpenBadgeCredential"],
      "id": credentialId,
      "name": course.title,
      "issuer": {
        "id": `https://dgihub.go.id/issuers/mitra-${mitraId}`,
        "type": "Profile",
        "name": issuerName
      },
      "issuanceDate": new Date().toISOString(),
      "expirationDate": course.expiration_date || new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      "credentialSubject": {
        "id": `did:key:${talentaId}`,
        "type": "AchievementSubject",
        "achievement": {
          "id": `https://dgihub.go.id/achievements/${kursusId}`,
          "type": "Achievement",
          "name": {
            "en-US": course.title,
            "id-ID": course.title
          },
          "description": {
            "en-US": course.description || course.title,
            "id-ID": course.description || course.title
          },
          "criteria": {
            "id": `https://dgihub.go.id/criteria/${kursusId}`,
            "narrative": `Completed ${course.title} with required assessments`
          },
          "alignment": []
        },
        "results": []
      }
    };

    // Add SKKNI alignment
    if (course.skkni_code) {
      credential.credentialSubject.achievement.alignment.push({
        "targetName": {
          "en-US": `SKKNI - ${course.skkni_code}`,
          "id-ID": `SKKNI - ${course.skkni_code}`
        },
        "targetUrl": `https://sni.bkn.go.id/skkni/${course.skkni_code}`,
        "targetCode": course.skkni_code,
        "targetFramework": {
          "id": "https://sni.bkn.go.id/frameworks/skkni",
          "name": "Standar Kompetensi Kerja Nasional Indonesia"
        }
      });
    }

    // Add AQRF alignment
    if (course.aqrf_level) {
      credential.credentialSubject.achievement.alignment.push({
        "targetName": {
          "en-US": `AQRF Level ${course.aqrf_level}`,
          "id-ID": `AQRF Level ${course.aqrf_level}`
        },
        "targetUrl": `https://aqrf.org/levels/${course.aqrf_level}`,
        "targetCode": `AQRF-${course.aqrf_level}`,
        "targetFramework": {
          "id": "https://aqrf.org/framework",
          "name": "ASEAN Qualifications Reference Framework"
        }
      });
    }

    // Add results
    if (score !== null && score !== undefined) {
      credential.credentialSubject.results.push({
        "id": `https://dgihub.go.id/results/${certificateNumber}`,
        "type": "Result",
        "resultDescription": {
          "id": "https://dgihub.go.id/result-descriptions/score"
        },
        "value": score
      });
    }

    if (grade) {
      credential.credentialSubject.results.push({
        "id": `https://dgihub.go.id/results/${certificateNumber}-grade`,
        "type": "Result",
        "resultDescription": {
          "id": "https://dgihub.go.id/result-descriptions/grade"
        },
        "value": grade
      });
    }

    return credential;
  }
}

module.exports = new CertificateService();


