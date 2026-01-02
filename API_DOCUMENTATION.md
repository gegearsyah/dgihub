# DGIHub Platform API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "userType": "TALENTA",
  "nik": "3201010101010001",
  "phone": "081234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your account.",
  "data": {
    "userId": "uuid",
    "userType": "TALENTA",
    "verificationRequired": true
  }
}
```

### POST /auth/login
Login and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "refreshToken": "refresh-token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "userType": "TALENTA"
    },
    "expiresIn": 86400
  }
}
```

---

## Talenta (Learner) Endpoints

### GET /talenta/learning-hub
Get available courses.

**Query Parameters:**
- `search` (string, optional): Search term
- `skkniCode` (string, optional): Filter by SKKNI code
- `aqrfLevel` (integer, optional): Filter by AQRF level
- `provider` (uuid, optional): Filter by provider
- `page` (integer, default: 1): Page number
- `limit` (integer, default: 20): Results per page

**Response:**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "kursus_id": "uuid",
        "title": "Advanced Software Development",
        "description": "...",
        "duration_hours": 1440,
        "price": 5000000,
        "skkni_code": "SKKNI-IT-2023-001",
        "aqrf_level": 6,
        "provider_name": "LPK Teknologi Indonesia",
        "is_enrolled": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### POST /talenta/apply
Apply for a job.

**Request Body:**
```json
{
  "lowonganId": "uuid",
  "coverLetter": "Optional cover letter"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "applicationId": "uuid",
    "appliedAt": "2024-01-15T10:00:00Z",
    "status": "PENDING",
    "eligibility": {
      "eligible": true,
      "checks": {
        "skills": true,
        "certificates": true,
        "aqrfLevel": true
      }
    }
  }
}
```

### GET /talenta/certificates
Get user's certificates.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "sertifikat_id": "uuid",
      "certificate_number": "CERT-2024-001",
      "title": "Advanced Software Development",
      "issued_date": "2024-01-15T10:00:00Z",
      "skkni_code": "SKKNI-IT-2023-001",
      "aqrf_level": 6,
      "status": "ACTIVE"
    }
  ]
}
```

---

## Mitra (Training Provider) Endpoints

### POST /mitra/courses
Create a new course.

**Request Body:**
```json
{
  "title": "Advanced Software Development",
  "titleEn": "Advanced Software Development",
  "description": "Comprehensive training...",
  "durationHours": 1440,
  "durationDays": 180,
  "price": 5000000,
  "skkniCode": "SKKNI-IT-2023-001",
  "aqrfLevel": 6,
  "prerequisites": [],
  "learningOutcomes": ["Skill 1", "Skill 2"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "courseId": "uuid",
    "title": "Advanced Software Development",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### POST /mitra/issue-certificate
Issue certificate to a learner.

**Request Body:**
```json
{
  "talentaId": "uuid",
  "kursusId": "uuid",
  "score": 92.5,
  "grade": "A",
  "level": "Expert"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate issued successfully",
  "data": {
    "certificateId": "uuid",
    "certificateNumber": "CERT-2024-001234",
    "credentialId": "https://dgihub.go.id/credentials/badges/uuid"
  }
}
```

### GET /mitra/courses/:courseId/participants
Get course participants.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "enrollment_id": "uuid",
      "talenta_id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "enrolled_at": "2024-01-15T10:00:00Z",
      "status": "ACTIVE",
      "progress": 75.5,
      "certificate_number": "CERT-2024-001"
    }
  ]
}
```

---

## Industri (Employer) Endpoints

### GET /industri/search-talenta
Search for talent.

**Query Parameters:**
- `skills` (array, optional): Required skills
- `skkniCodes` (array, optional): Required SKKNI codes
- `aqrfLevel` (integer, optional): Minimum AQRF level
- `location` (string, optional): Location filter
- `hasCertificates` (boolean, optional): Require certificates
- `page` (integer, default: 1)
- `limit` (integer, default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "talents": [
      {
        "talenta_id": "uuid",
        "full_name": "John Doe",
        "city": "Jakarta",
        "certificate_count": 5,
        "skkni_codes": ["SKKNI-IT-2023-001"],
        "max_aqrf_level": 6,
        "match_score": 95
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### GET /industri/talenta/:talentaId
Get detailed talent profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "profile_id": "uuid",
      "full_name": "John Doe",
      "city": "Jakarta",
      "skills": ["Java", "Python", "Cloud"],
      "aqrf_level": 6
    },
    "certificates": [
      {
        "sertifikat_id": "uuid",
        "title": "Advanced Software Development",
        "skkni_code": "SKKNI-IT-2023-001",
        "aqrf_level": 6,
        "issued_date": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

---

## Error Responses

All endpoints may return error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Rate Limiting

API requests are rate-limited:
- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 20, max: 100)

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Testing with cURL

### Example: Register and Login

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "userType": "TALENTA",
    "nik": "3201010101010001"
  }'

# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.data.token')

# Use token
curl http://localhost:3000/api/v1/talenta/learning-hub \
  -H "Authorization: Bearer $TOKEN"
```

---

**For more details, see the complete documentation in `docs/` folder.**


