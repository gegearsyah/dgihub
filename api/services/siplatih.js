/**
 * SIPLatih Service
 * Integration with Ministry of Manpower's SIPLatih system
 */

const axios = require('axios');

class SIPLatihService {
  constructor() {
    this.baseUrl = process.env.SIPLATIH_API_URL || 'https://siplatih.kemnaker.go.id/api/v1';
    this.clientId = process.env.SIPLATIH_CLIENT_ID;
    this.clientSecret = process.env.SIPLATIH_CLIENT_SECRET;
    this.tokenCache = {};
  }

  /**
   * Get OAuth 2.0 access token
   */
  async getAccessToken() {
    // Check cache
    if (this.tokenCache.token && this.tokenCache.expiresAt > Date.now()) {
      return this.tokenCache.token;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/oauth/token`,
        {
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: 'training:read training:write credential:read credential:write'
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      this.tokenCache = {
        token: response.data.access_token,
        expiresAt: Date.now() + (response.data.expires_in * 1000) - 60000 // 1 minute buffer
      };

      return this.tokenCache.token;
    } catch (error) {
      console.error('SIPLatih token error:', error);
      throw new Error('Failed to get SIPLatih access token');
    }
  }

  /**
   * Register training program with SIPLatih
   */
  async registerTrainingProgram(programData) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(
        `${this.baseUrl}/training-programs`,
        {
          program_code: programData.programCode,
          program_name: programData.programName,
          program_name_en: programData.programNameEn || programData.programName,
          skkni_code: programData.skkniCode,
          duration_days: programData.durationDays,
          duration_hours: programData.durationHours,
          start_date: programData.startDate,
          end_date: programData.endDate,
          location: programData.location
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return {
        success: true,
        siplatihProgramId: response.data.data.siplatih_program_id,
        programCode: response.data.data.program_code
      };
    } catch (error) {
      console.error('SIPLatih registration error:', error);
      throw new Error('Failed to register program with SIPLatih');
    }
  }

  /**
   * Report training completion
   */
  async reportCompletion(siplatihProgramId, completionData) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(
        `${this.baseUrl}/training-programs/${siplatihProgramId}/completions`,
        {
          completion_date: completionData.completionDate,
          participants: completionData.participants,
          completion_rate: completionData.completionRate,
          certification_rate: completionData.certificationRate
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('SIPLatih completion report error:', error);
      throw new Error('Failed to report completion to SIPLatih');
    }
  }
}

module.exports = new SIPLatihService();


