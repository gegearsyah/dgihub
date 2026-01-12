/**
 * API Client for DGIHub Platform
 * Handles all API requests to the backend
 */

// Use external backend URL if set, otherwise use Next.js API routes (same origin)
// Set NEXT_PUBLIC_API_URL in Vercel environment variables to use external backend
// Example: NEXT_PUBLIC_API_URL=https://dgihub-backend.onrender.com/api/v1
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      // Get response text first to check if it's empty
      const text = await response.text();
      
      // If response is empty or not JSON, handle accordingly
      if (!text || !isJson) {
        if (!response.ok) {
          // Return appropriate error based on status code
          let errorMessage = 'An error occurred';
          if (response.status === 405) {
            errorMessage = 'Method not allowed. Please check the API endpoint.';
          } else if (response.status === 404) {
            errorMessage = 'API endpoint not found';
          } else if (response.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else {
            errorMessage = `Request failed with status ${response.status}`;
          }
          
          return {
            success: false,
            message: errorMessage,
          };
        }
        
        // If response is OK but not JSON, return success with undefined data
        // This is an edge case - API should normally return JSON
        return {
          success: true,
          data: undefined as T,
          message: text || 'Request successful but no data returned',
        };
      }

      // Parse JSON only if we have valid JSON content
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        return {
          success: false,
          message: 'Invalid response format from server',
        };
      }

      if (!response.ok) {
        return {
          success: false,
          message: data.message || `Request failed with status ${response.status}`,
          errors: data.errors,
        };
      }

      // Backend returns { success: true, data: {...} }
      // Return the data property directly, or the whole response if no data property
      return {
        success: data.success !== false,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication endpoints
  async register(userData: {
    email: string;
    password: string;
    fullName: string;
    userType: 'TALENTA' | 'MITRA' | 'INDUSTRI';
    nik?: string;
    phone?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ token: string; refreshToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request<{ token: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health', {
      method: 'GET',
    });
  }

  // API info
  async getApiInfo() {
    return this.request('/');
  }

  // Talenta endpoints
  async getCourses(filters?: any) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.skkniCode) params.append('skkniCode', filters.skkniCode);
    if (filters?.aqrfLevel) params.append('aqrfLevel', filters.aqrfLevel);
    return this.request(`/talenta/learning-hub?${params.toString()}`);
  }

  async enrollInCourse(kursusId: string) {
    return this.request('/talenta/enroll', {
      method: 'POST',
      body: JSON.stringify({ kursusId }),
    });
  }

  async getMyCourses() {
    return this.request('/talenta/my-courses');
  }

  async getCertificates() {
    return this.request('/talenta/certificates');
  }

  async getWorkshops(filters?: any) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.location) params.append('location', filters.location);
    return this.request(`/talenta/workshops?${params.toString()}`);
  }

  async registerForWorkshop(workshopId: string, location?: { latitude: number; longitude: number }) {
    return this.request(`/talenta/workshops/${workshopId}/register`, {
      method: 'POST',
      body: JSON.stringify(location || {}),
    });
  }

  // Mitra endpoints
  async createCourse(courseData: any) {
    return this.request('/mitra/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async getCourseParticipants(kursusId: string) {
    return this.request(`/mitra/courses/${kursusId}/participants`);
  }

  async issueCertificate(certificateData: any) {
    return this.request('/mitra/issue-certificate', {
      method: 'POST',
      body: JSON.stringify(certificateData),
    });
  }

  async createWorkshop(workshopData: any) {
    return this.request('/mitra/workshops', {
      method: 'POST',
      body: JSON.stringify(workshopData),
    });
  }

  async getWorkshopAttendance(workshopId: string) {
    return this.request(`/mitra/workshops/${workshopId}/attendance`);
  }

  // Industri endpoints
  async searchTalenta(filters?: any) {
    const params = new URLSearchParams();
    if (filters?.skills) params.append('skills', Array.isArray(filters.skills) ? filters.skills.join(',') : filters.skills);
    if (filters?.skkniCodes) params.append('skkniCodes', Array.isArray(filters.skkniCodes) ? filters.skkniCodes.join(',') : filters.skkniCodes);
    if (filters?.aqrfLevel) params.append('aqrfLevel', filters.aqrfLevel);
    if (filters?.location) params.append('location', filters.location);
    return this.request(`/industri/search-talenta?${params.toString()}`);
  }

  async getTalentaProfile(talentaId: string) {
    return this.request(`/industri/talenta/${talentaId}`);
  }

  async createJobPosting(jobData: any) {
    return this.request('/industri/job-postings', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async getJobApplicants(lowonganId: string) {
    return this.request(`/industri/job-postings/${lowonganId}/applicants`);
  }

  async getJobPostings() {
    return this.request('/industri/job-postings');
  }

  async makeHiringDecision(applicationId: string, decision: { decision: string; notes?: string; saveToTalentPool?: boolean }) {
    return this.request(`/industri/applications/${applicationId}/decision`, {
      method: 'POST',
      body: JSON.stringify(decision),
    });
  }

  // Mitra additional endpoints
  async getMitraCourses() {
    return this.request('/mitra/courses');
  }

  async getMitraWorkshops() {
    return this.request('/mitra/workshops');
  }

  // Talenta additional endpoints
  async getMyApplications() {
    return this.request('/talenta/applications');
  }

  async applyForJob(jobData: { lowonganId: string; coverLetter?: string }) {
    return this.request('/talenta/apply', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  // Profile endpoints
  async updateProfile(profileData: { fullName?: string; phone?: string }) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Certificate verification (public)
  async verifyCertificate(certificateId: string) {
    return this.request(`/certificates/verify/${certificateId}`, {
      method: 'GET',
    });
  }

  // Course Materials
  async getCourseMaterials(courseId: string) {
    return this.request(`/talenta/courses/${courseId}/materials`);
  }

  async createCourseMaterial(courseId: string, materialData: any) {
    return this.request(`/mitra/courses/${courseId}/materials`, {
      method: 'POST',
      body: JSON.stringify(materialData),
    });
  }

  async markMaterialComplete(materialId: string) {
    return this.request(`/talenta/materials/${materialId}/complete`, {
      method: 'POST',
    });
  }

  // Quizzes
  async submitQuiz(materialId: string, answers: Record<string, any>) {
    return this.request(`/talenta/quizzes/${materialId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  // Workshop Attendance
  async recordWorkshopAttendance(workshopId: string, location: { latitude: number; longitude: number }) {
    return this.request(`/talenta/workshops/${workshopId}/attendance`, {
      method: 'POST',
      body: JSON.stringify(location),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

