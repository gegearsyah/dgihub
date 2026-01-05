# Database Seeding Guide

## Overview

This guide explains how to seed the database with comprehensive dummy data for all roles.

## Quick Start

### Option 1: Basic Seed (Minimal Data)
```bash
npm run db:seed
```

This creates:
- 3 users (1 Talenta, 1 Mitra, 1 Industri)
- 1 course
- 1 certificate
- 1 job posting

### Option 2: Comprehensive Seed (Full Dummy Data) ⭐ RECOMMENDED
```bash
npm run db:seed:full
```

This creates:
- **11 users** (5 Talenta, 3 Mitra, 3 Industri)
- **6 courses** with materials
- **8 enrollments**
- **4 certificates**
- **2 workshops** with registrations
- **4 job postings**
- **4 job applications**

## What Gets Created

### Users & Profiles

#### Talenta Users (5 users)
1. `talenta1@demo.com` - John Doe (Jakarta, AQRF 6)
2. `talenta2@demo.com` - Jane Smith (Bandung, AQRF 5)
3. `talenta3@demo.com` - Bob Johnson (Surabaya, AQRF 6)
4. `talenta4@demo.com` - Alice Williams (Yogyakarta, AQRF 4)
5. `talenta5@demo.com` - Charlie Brown (Medan, AQRF 7)

**Password for all:** `password123`

#### Mitra Users (3 users)
1. `mitra1@demo.com` - LPK Teknologi Indonesia
2. `mitra2@demo.com` - LPK Cloud Solutions
3. `mitra3@demo.com` - LPK Digital Skills Academy

**Password for all:** `password123`

#### Industri Users (3 users)
1. `industri1@demo.com` - PT Teknologi Maju
2. `industri2@demo.com` - PT Digital Innovation
3. `industri3@demo.com` - PT Smart Solutions

**Password for all:** `password123`

### Courses

1. **Advanced Software Development** (LPK Teknologi Indonesia)
   - SKKNI: IT-2023-001
   - AQRF: Level 6
   - Price: Rp 2,500,000
   - Duration: 120 hours / 15 days

2. **Cloud Architecture Fundamentals** (LPK Teknologi Indonesia)
   - SKKNI: IT-2023-002
   - AQRF: Level 5
   - Price: Rp 1,800,000
   - Duration: 80 hours / 10 days

3. **Data Science & Machine Learning** (LPK Cloud Solutions)
   - SKKNI: IT-2023-003
   - AQRF: Level 6
   - Price: Rp 3,000,000
   - Duration: 100 hours / 12 days

4. **Full Stack Web Development** (LPK Cloud Solutions)
   - SKKNI: IT-2023-004
   - AQRF: Level 5
   - Price: Rp 3,500,000
   - Duration: 150 hours / 18 days

5. **UI/UX Design Mastery** (LPK Digital Skills Academy)
   - SKKNI: DESIGN-2023-001
   - AQRF: Level 4
   - Price: Rp 2,200,000
   - Duration: 90 hours / 11 days

6. **DevOps Engineering** (LPK Digital Skills Academy)
   - SKKNI: DEVOPS-2023-001
   - AQRF: Level 7
   - Price: Rp 2,800,000
   - Duration: 110 hours / 14 days

### Enrollments

- John Doe enrolled in 2 courses (75% and 45% progress)
- Jane Smith enrolled in 2 courses (90% and 30% progress)
- Bob Johnson completed 1 course (100%) and enrolled in 1 more
- Alice Williams enrolled in UI/UX course (85% progress)
- Charlie Brown enrolled in DevOps course (50% progress)

### Certificates

- John Doe: Advanced Software Development (Score: 85, Grade: A)
- Bob Johnson: Advanced Software Development (Score: 92, Grade: A)
- Jane Smith: Data Science & Machine Learning (Score: 88, Grade: A)
- Alice Williams: UI/UX Design Mastery (Score: 90, Grade: A)

### Workshops

1. **Hands-on React Workshop** (Jakarta)
   - Date: 2024-02-15
   - Capacity: 30
   - Price: Rp 500,000
   - GPS attendance enabled

2. **Data Science Bootcamp** (Bandung)
   - Date: 2024-02-20 to 2024-02-22
   - Capacity: 25
   - Price: Rp 750,000
   - GPS attendance enabled

### Job Postings

1. **Senior Software Engineer** (PT Teknologi Maju)
   - Location: Jakarta
   - Salary: Rp 15M - 25M
   - Requires: SKKNI-IT-2023-001, AQRF 6+

2. **Cloud Solutions Architect** (PT Teknologi Maju)
   - Location: Jakarta
   - Salary: Rp 20M - 35M
   - Requires: SKKNI-IT-2023-002, AQRF 7+

3. **Data Scientist** (PT Digital Innovation)
   - Location: Bandung
   - Salary: Rp 18M - 30M
   - Requires: SKKNI-IT-2023-003, AQRF 6+

4. **UI/UX Designer** (PT Smart Solutions)
   - Location: Yogyakarta
   - Salary: Rp 12M - 20M
   - Requires: SKKNI-DESIGN-2023-001, AQRF 4+

### Job Applications

- John Doe applied for Senior Software Engineer
- Bob Johnson applied for Senior Software Engineer
- Jane Smith applied for Data Scientist
- Alice Williams applied for UI/UX Designer

## Usage

### 1. Reset Database (Optional)
If you want to start fresh:
```bash
npm run db:reset
```

### 2. Run Migrations
```bash
npm run db:migrate
```

### 3. Seed Data
```bash
# For comprehensive data
npm run db:seed:full

# For basic data
npm run db:seed
```

## Testing Scenarios

### As Talenta User
1. Login as `talenta1@demo.com`
2. Browse courses - see 6 available courses
3. View "My Courses" - see 2 enrolled courses
4. View certificates - see 1 certificate
5. Browse workshops - see 2 workshops
6. Apply for jobs - see 4 job postings

### As Mitra User
1. Login as `mitra1@demo.com`
2. View courses - see 2 created courses
3. View participants - see enrolled students
4. Issue certificates - can issue to completed students
5. Manage workshops - see created workshops

### As Industri User
1. Login as `industri1@demo.com`
2. Search talent - find candidates with certificates
3. View job postings - see 2 created jobs
4. View applicants - see applications received

## Data Relationships

```
Users (11)
├── Talenta Profiles (5)
│   ├── Enrollments (8)
│   ├── Certificates (4)
│   ├── Workshop Registrations (3)
│   └── Job Applications (4)
├── Mitra Profiles (3)
│   ├── Courses (6)
│   │   └── Materials (10)
│   └── Workshops (2)
└── Industri Profiles (3)
    └── Job Postings (4)
```

## Notes

- All passwords are: `password123`
- All users are verified and active
- All courses are published
- All job postings are published
- Certificates are in Open Badges 3.0 format
- Workshop attendance uses GPS verification
- Skills are stored as JSONB with name, level, and verified status

## Troubleshooting

If seeding fails:
1. Make sure database is running
2. Check `.env` file has correct database credentials
3. Run migrations first: `npm run db:migrate`
4. Try resetting: `npm run db:reset` then `npm run db:seed:full`

---

**Last Updated**: 2024-01-15




