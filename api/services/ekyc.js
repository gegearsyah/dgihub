/**
 * e-KYC Service
 * Flow Chart Node: [23]
 * Handles NIK validation and biometric liveness detection
 */

const { pool } = require('../config/database');
const { dukcapilService } = require('./dukcapil');
const { biometricService } = require('./biometric');
const crypto = require('crypto');

class EKYCService {
  /**
   * Perform complete e-KYC verification
   * @param {Object} ekycData - e-KYC data
   * @returns {Promise<Object>} Verification result
   */
  async performEKYC(ekycData) {
    const { nik, biometricData, documentData } = ekycData;

    try {
      // Step 1: Validate NIK format
      if (!this.validateNIKFormat(nik)) {
        return {
          verified: false,
          reason: 'Invalid NIK format'
        };
      }

      // Step 2: Validate NIK against Dukcapil
      const nikValidation = await dukcapilService.validateNIK(nik);
      if (!nikValidation.valid) {
        return {
          verified: false,
          reason: 'NIK validation failed',
          details: nikValidation.error
        };
      }

      // Step 3: Verify document (KTP)
      const documentVerification = await this.verifyDocument(documentData);
      if (!documentVerification.valid) {
        return {
          verified: false,
          reason: 'Document verification failed',
          details: documentVerification.error
        };
      }

      // Step 4: Detect biometric liveness
      const livenessResult = await biometricService.detectLiveness(
        biometricData.type,
        biometricData.data
      );

      if (!livenessResult.isLive) {
        return {
          verified: false,
          reason: 'Biometric liveness detection failed',
          livenessScore: livenessResult.livenessScore
        };
      }

      // Step 5: Extract and hash biometric template
      const biometricHash = await this.extractBiometricHash(
        biometricData.type,
        biometricData.data
      );

      // Step 6: Store encrypted biometric (using HSM)
      const encryptedBiometric = await this.encryptBiometric(
        biometricData.data,
        biometricData.type
      );

      return {
        verified: true,
        nik: nik,
        nikData: nikValidation.data,
        biometricHash: biometricHash,
        encryptedBiometric: encryptedBiometric,
        livenessScore: livenessResult.livenessScore,
        verifiedAt: new Date()
      };
    } catch (error) {
      console.error('e-KYC error:', error);
      return {
        verified: false,
        reason: 'e-KYC processing failed',
        error: error.message
      };
    }
  }

  /**
   * Validate NIK format (16 digits)
   */
  validateNIKFormat(nik) {
    if (!nik || typeof nik !== 'string') {
      return false;
    }

    if (nik.length !== 16) {
      return false;
    }

    if (!/^\d+$/.test(nik)) {
      return false;
    }

    // Validate province code (first 2 digits: 01-94)
    const provinceCode = parseInt(nik.substring(0, 2));
    if (provinceCode < 1 || provinceCode > 94) {
      return false;
    }

    return true;
  }

  /**
   * Verify document (KTP)
   */
  async verifyDocument(documentData) {
    // Implement OCR and document verification
    // This would integrate with document verification service
    return {
      valid: true,
      extractedData: {
        nik: documentData.nik,
        name: documentData.name,
        dateOfBirth: documentData.dateOfBirth
      }
    };
  }

  /**
   * Extract biometric hash for storage
   */
  async extractBiometricHash(biometricType, biometricData) {
    // Convert base64 to buffer
    const buffer = Buffer.from(biometricData, 'base64');
    
    // Generate SHA-256 hash
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    
    return hash;
  }

  /**
   * Encrypt biometric data using HSM
   */
  async encryptBiometric(biometricData, biometricType) {
    // This would integrate with CloudHSM
    // For now, return placeholder
    return {
      encrypted: true,
      keyId: `pii-biometric-${biometricType.toLowerCase()}-key`,
      algorithm: 'HSM_AES256'
    };
  }
}

module.exports = new EKYCService();


