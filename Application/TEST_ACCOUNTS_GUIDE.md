# Test Accounts Guide

This guide lists all available test accounts and what features you can test with each account type.

## 🔑 Quick Reference

**Default Password for All Accounts:** `password123`

---

## 📚 Account Types & Features

### 🎓 TALENTA (Learner/Student) Accounts

Test accounts for learners who want to take courses, earn certificates, and apply for jobs.

#### Basic Test Accounts (from CREATE_TEST_USERS.sql)
- **Email:** `talenta@test.com`
- **Password:** `password123` (if using proper seed script)
- **Features:**
  - Browse courses
  - Enroll in courses
  - Access learning materials (videos, PDFs, quizzes)
  - Complete quizzes
  - View progress
  - Register for workshops
  - Record workshop attendance (GPS-based)
  - Apply for jobs
  - View certificates

#### Comprehensive Demo Accounts (from seed scripts)
- **Email:** `talenta1@demo.com` - Budi Santoso (Active, has certificates)
- **Email:** `talenta2@demo.com` - Siti Nurhaliza (Active, has certificates)
- **Email:** `talenta3@demo.com` - Ahmad Fauzi (Active)
- **Email:** `talenta4@demo.com` - Dewi Sartika (Verified, incomplete profile)
- **Email:** `talenta5@demo.com` - Rizki Pratama (Active)
- **Password:** `password123`

**What to Test with Talenta:**
- ✅ Course browsing and search
- ✅ Course enrollment
- ✅ Learning experience (videos, documents, quizzes)
- ✅ Quiz taking and submission
- ✅ Progress tracking
- ✅ Material completion
- ✅ Workshop registration
- ✅ Workshop attendance (GPS location)
- ✅ Job browsing and applications
- ✅ Certificate viewing
- ✅ Profile management

---

### 🏢 MITRA (Training Provider) Accounts

Test accounts for training providers who create and manage courses.

#### Basic Test Accounts (from CREATE_TEST_USERS.sql)
- **Email:** `mitra@test.com`
- **Password:** `password123` (if using proper seed script)
- **Features:**
  - Create courses
  - Manage course materials (videos, PDFs, quizzes)
  - Create quizzes with questions
  - Publish/unpublish courses
  - View enrolled students
  - Create workshops
  - Manage workshop registrations
  - Issue certificates

#### Comprehensive Demo Accounts (from seed scripts)
- **Email:** `mitra1@demo.com` - LPK Teknologi Indonesia
- **Email:** `mitra2@demo.com` - LPK Cloud Solutions
- **Email:** `mitra3@demo.com` - LPK Digital Skills Academy
- **Password:** `password123`

**What to Test with Mitra:**
- ✅ Course creation and management
- ✅ Material upload (videos, PDFs)
- ✅ Quiz builder (create quizzes with multiple questions)
- ✅ Course publishing
- ✅ Student enrollment management
- ✅ Workshop creation with location data
- ✅ Workshop management
- ✅ Certificate issuance
- ✅ Analytics and reports

---

### 🏭 INDUSTRI (Employer) Accounts

Test accounts for companies who post jobs and hire talent.

#### Comprehensive Demo Accounts (from seed scripts)
- **Email:** `industri1@demo.com` - PT Teknologi Maju
- **Email:** `industri2@demo.com` - PT Digital Innovation
- **Email:** `industri3@demo.com` - PT Smart Solutions
- **Password:** `password123`

**What to Test with Industri:**
- ✅ Job posting creation
- ✅ Job posting management
- ✅ Browse available talent
- ✅ View applicant profiles
- ✅ Review job applications
- ✅ Accept/reject applications
- ✅ Search for candidates by skills
- ✅ View candidate certificates

---

## 🚀 Quick Setup

### Option 1: Using CREATE_TEST_USERS.sql (Basic)

1. Run the SQL script in Supabase:
   ```sql
   -- Run Application/supabase/CREATE_TEST_USERS.sql
   ```

2. Then run seed data:
   ```sql
   -- Run Application/supabase/seed_learning_data.sql
   ```

3. Login with:
   - `mitra@test.com` / `password123`
   - `talenta@test.com` / `password123`

**Note:** These accounts use dummy password hashes. You'll need to register through the app or use the proper seed script.

### Option 2: Using Comprehensive Seed Script (Recommended)

1. Run the comprehensive seed script:
   ```bash
   node scripts/seed-supabase.js
   # OR
   npm run db:seed
   ```

2. This creates all demo accounts with proper password hashes.

3. Login with any of the accounts listed above.

---

## 🧪 Testing Scenarios

### Scenario 1: Complete Learning Flow
1. **Login as Talenta:** `talenta1@demo.com`
2. Browse courses
3. Enroll in "Full Stack Web Development"
4. Watch video materials
5. Read PDF documents
6. Take quiz
7. Complete course
8. View certificate

### Scenario 2: Course Creation Flow
1. **Login as Mitra:** `mitra1@demo.com`
2. Create new course
3. Add video materials
4. Add PDF materials
5. Create quiz with questions
6. Publish course
7. View enrolled students

### Scenario 3: Workshop Attendance
1. **Login as Talenta:** `talenta1@demo.com`
2. Register for workshop
3. On workshop day, record attendance with GPS
4. Verify location matches workshop location

### Scenario 4: Job Application Flow
1. **Login as Talenta:** `talenta1@demo.com`
2. Browse job postings
3. Apply for a job
4. **Login as Industri:** `industri1@demo.com`
5. View applications
6. Review candidate profile
7. Accept/reject application

---

## 🔍 Verify Accounts Exist

Run this SQL query in Supabase to check all available accounts:

```sql
SELECT 
  email,
  full_name,
  user_type,
  status,
  email_verified
FROM public.users
ORDER BY user_type, email;
```

---

## ⚠️ Important Notes

1. **Password:** All demo accounts use `password123` (if seeded properly)
2. **Status:** Accounts should be `ACTIVE` and `email_verified = true`
3. **Profiles:** Each user needs a corresponding profile (talenta_profiles, mitra_profiles, industri_profiles)
4. **Seed Data:** Make sure you've run the seed data to have courses, materials, and workshops available

---

## 🐛 Troubleshooting

### Can't Login?
1. Check if account exists: Run the SQL query above
2. Check account status: Should be `ACTIVE`
3. Check email verification: Should be `true`
4. Try resetting password through the app

### No Courses/Materials?
1. Make sure you ran `seed_learning_data.sql`
2. Check if courses exist:
   ```sql
   SELECT * FROM public.kursus;
   ```

### No Enrollments?
1. Make sure you ran the seed data
2. Check enrollments:
   ```sql
   SELECT * FROM public.enrollments;
   ```

---

## 📝 Account Summary Table

| User Type | Email | Password | Has Courses | Has Enrollments | Has Jobs |
|-----------|-------|----------|-------------|-----------------|----------|
| **Talenta** | `talenta1@demo.com` | `password123` | ✅ (enrolled) | ✅ | ✅ (applied) |
| **Talenta** | `talenta2@demo.com` | `password123` | ✅ (enrolled) | ✅ | ✅ (applied) |
| **Talenta** | `talenta3@demo.com` | `password123` | ✅ (enrolled) | ✅ | ✅ (applied) |
| **Mitra** | `mitra1@demo.com` | `password123` | ✅ (created) | ✅ (students) | ❌ |
| **Mitra** | `mitra2@demo.com` | `password123` | ✅ (created) | ✅ (students) | ❌ |
| **Mitra** | `mitra3@demo.com` | `password123` | ✅ (created) | ✅ (students) | ❌ |
| **Industri** | `industri1@demo.com` | `password123` | ❌ | ❌ | ✅ (posted) |
| **Industri** | `industri2@demo.com` | `password123` | ❌ | ❌ | ✅ (posted) |
| **Industri** | `industri3@demo.com` | `password123` | ❌ | ❌ | ✅ (posted) |

---

## 🎯 Recommended Testing Order

1. **Start with Talenta** - Test learning features
2. **Switch to Mitra** - Test course creation
3. **Switch to Industri** - Test job posting
4. **Back to Talenta** - Test job applications
5. **Back to Industri** - Test reviewing applications

This gives you a complete end-to-end test of all features!
