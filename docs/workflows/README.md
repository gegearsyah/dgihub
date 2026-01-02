# Workflows Documentation

## Overview

This directory contains functional workflow implementations based on the platform flow chart, covering all three user tracks (Talenta, Mitra, Industri) and their integrations.

## Documentation Index

### 1. Talenta (Learner) Path
**File**: `talenta-learner-path.md`

**Flow Chart Nodes**: [30-31, 46-47, 63-64, 60-62, 24]

**Contents**:
- Talenta Dashboard [24]
- Digital Learning Hub [30, 37, 46, 61]
- Workshop Search & Registration [31, 38, 47]
- Career Engine (Job Search & Applications) [63, 64, 65, 67]
- Certificate flow to profile [60, 62, 39]

**Key Features**:
- Course enrollment and completion
- Certificate issuance and profile update
- Workshop registration with GPS attendance
- Job application with eligibility checking
- Interview scheduling

---

### 2. Mitra (Training Partner) Path
**File**: `mitra-partner-path.md`

**Flow Chart Nodes**: [27-29, 34-36, 43-45, 20]

**Contents**:
- Mitra Dashboard [20]
- Course Management [27, 34, 43, 51]
- Workshop Management [28, 35, 44]
- Participant Management [29, 36, 45]

**Key Features**:
- Course creation and material upload
- Workshop scheduling with TeFa integration
- Participant progress monitoring
- Certificate issuance

---

### 3. Industri (Employer) Path
**File**: `industri-employer-path.md`

**Flow Chart Nodes**: [25-26, 32-33, 40-42, 48-50, 52-58, 18]

**Contents**:
- Industri Dashboard [18]
- Recruitment Management [25, 32, 41, 49]
- Job Posting [26, 33, 42, 50]
- Talent Search [40, 48, 58]

**Key Features**:
- Application review and shortlisting
- Interview scheduling
- Hiring decision processing
- Job posting and publishing
- Talent search with matching
- Talent pool management

---

### 4. Integration Logic
**File**: `integration-logic.md`

**Flow Chart Nodes**: [53-55, 57-58, 59, 60-62, 52, 39, 65]

**Contents**:
- Certificate flow integration [60, 61, 62, 52, 39]
- Hiring decision processing [53, 54, 55, 57, 58]
- Job posting to talent view [59, 65]
- State management integration
- Event-driven workflows

**Key Features**:
- Certificate visibility to industry
- Hiring acceptance/rejection flows
- Talent pool saving logic
- Job application eligibility
- Cross-track state synchronization

---

### 5. Registration & Verification API
**File**: `registration-verification-api.md`

**Flow Chart Nodes**: [1-3, 13-15, 17, 19, 23]

**Contents**:
- Unified registration [1-3]
- Talenta verification [23]
- Mitra verification [19]
- Industri verification [17]
- Common verification endpoints

**Key Features**:
- Multi-type user registration
- Email/SMS verification
- e-KYC for Talenta
- Document verification for Mitra/Industri
- Admin approval workflows

---

## Component Architecture

### Dashboard Components

| Dashboard | Component | File |
|-----------|-----------|------|
| Talenta [24] | `TalentaDashboard` | `talenta-learner-path.md` |
| Mitra [20] | `MitraDashboard` | `mitra-partner-path.md` |
| Industri [18] | `IndustriDashboard` | `industri-employer-path.md` |

### Key Workflows

#### Certificate Flow
```
Mitra Issues Certificate [45]
  ↓
Certificate Added to Talenta Profile [39, 62]
  ↓
Certificate Visible to Industry [52]
  ↓
Used in Job Applications [61, 65]
```

#### Hiring Decision Flow
```
Application Review [25, 32]
  ↓
Interview Scheduled [49]
  ↓
Hiring Decision [53]
  ↓
Accept → Hiring Process [54, 55]
Reject → Talent Pool [57, 58]
```

#### Job Posting Flow
```
Job Created [26]
  ↓
Requirements Set [42]
  ↓
Job Published [50]
  ↓
Visible to Talenta [59]
  ↓
Applications Received [65]
```

## State Management

### Store Structure

```typescript
// Talenta Store
talentaStore: {
  profile, courses, workshops, certificates, applications
}

// Mitra Store
mitraStore: {
  profile, courses, workshops, participants, certificates
}

// Industri Store
industriStore: {
  profile, jobs, applications, talentPool, interviews
}

// Integration Store
integrationStore: {
  certificateUpdates, hiringDecisions, publishedJobs, talentPool
}
```

## API Endpoints Summary

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/verify-email` - Verify email

### Talenta
- `GET /api/v1/talenta/{userId}/dashboard` - Dashboard
- `GET /api/v1/talenta/courses` - Browse courses
- `POST /api/v1/talenta/{userId}/courses/{courseId}/enroll` - Enroll
- `POST /api/v1/talenta/{userId}/workshops/{workshopId}/register` - Register workshop
- `POST /api/v1/talenta/applications` - Apply for job

### Mitra
- `GET /api/v1/mitra/{partnerId}/dashboard` - Dashboard
- `POST /api/v1/mitra/courses` - Create course
- `POST /api/v1/mitra/courses/{courseId}/materials` - Upload materials
- `POST /api/v1/mitra/certificates/issue` - Issue certificate

### Industri
- `GET /api/v1/industri/{employerId}/dashboard` - Dashboard
- `POST /api/v1/industri/jobs` - Create job
- `GET /api/v1/industri/talents/search` - Search talent
- `POST /api/v1/industri/hiring-decisions` - Make hiring decision

## Implementation Checklist

### Phase 1: Core Workflows
- [ ] Talenta dashboard and learning hub
- [ ] Mitra course management
- [ ] Industri job posting
- [ ] Basic certificate flow

### Phase 2: Integration
- [ ] Certificate to profile update
- [ ] Job posting to talent view
- [ ] Hiring decision processing
- [ ] Talent pool management

### Phase 3: Advanced Features
- [ ] Workshop attendance tracking
- [ ] Interview scheduling
- [ ] Tax incentive integration
- [ ] Advanced search and matching

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0


