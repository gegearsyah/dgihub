/**
 * Dukcapil (Civil Registry) Service
 * Validates NIK against government database
 */

const axios = require('axios');

class DukcapilService {
  constructor() {
    this.baseUrl = process.env.DUKCAPIL_API_URL || 'https://api.dukcapil.go.id';
    this.apiKey = process.env.DUKCAPIL_API_KEY;
  }

  /**
   * Validate NIK against Dukcapil database
   * @param {string} nik - NIK to validate
   * @param {Object} additionalData - Additional data for validation
   * @returns {Promise<Object>} Validation result
   */
  async validateNIK(nik, additionalData = {}) {
    try {
      // In production, this would call the actual Dukcapil API
      // For now, implement basic validation and mock response
      
      if (!this.validateNIKFormat(nik)) {
        return {
          valid: false,
          error: 'Invalid NIK format'
        };
      }

      // Mock API call (replace with actual Dukcapil API)
      const response = await axios.post(
        `${this.baseUrl}/api/v1/nik/validate`,
        {
          nik: nik,
          fullName: additionalData.fullName,
          dateOfBirth: additionalData.dateOfBirth
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.data.status === 'VALID') {
        return {
          valid: true,
          data: {
            nik: response.data.nik,
            fullName: response.data.fullName,
            dateOfBirth: response.data.dateOfBirth,
            placeOfBirth: response.data.placeOfBirth,
            gender: response.data.gender,
            address: response.data.address
          }
        };
      } else {
        return {
          valid: false,
          error: response.data.message || 'NIK not found in database'
        };
      }
    } catch (error) {
      // If API is unavailable, return format validation only
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        console.warn('Dukcapil API unavailable, using format validation only');
        return {
          valid: this.validateNIKFormat(nik),
          error: this.validateNIKFormat(nik) ? null : 'Invalid NIK format',
          warning: 'Dukcapil API unavailable'
        };
      }

      return {
        valid: false,
        error: error.message || 'NIK validation failed'
      };
    }
  }

  /**
   * Validate NIK format
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

    return true;
  }
}

module.exports = new DukcapilService();


