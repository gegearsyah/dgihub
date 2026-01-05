# Seed Data Guide for Supabase

This guide explains how to populate your Supabase database with comprehensive interconnected data for testing all features.

## 📋 Overview

The seed data includes:
- **11 Users**: 5 Talenta, 3 Mitra, 3 Industri
- **11 Profiles**: Complete profiles for all users
- **9 Courses**: Published courses from different Mitra
- **12 Enrollments**: Talenta enrolled in various courses
- **4 Certificates**: Issued to Talenta for completed courses
- **6 Job Postings**: Published jobs from Industri companies
- **11 Job Applications**: Talenta applying to various jobs

## 🔑 Demo Accounts

All demo accounts use the password: **`password123`**

### Talenta Accounts
- `talenta1@demo.com` - Budi Santoso (Active, has certificates)
- `talenta2@demo.com` - Siti Nurhaliza (Active, has certificates)
- `talenta3@demo.com` - Ahmad Fauzi (Active)
- `talenta4@demo.com` - Dewi Sartika (Verified, incomplete profile)
- `talenta5@demo.com` - Rizki Pratama (Active)

### Mitra Accounts
- `mitra1@demo.com` - LPK Teknologi Indonesia
- `mitra2@demo.com` - LPK Cloud Solutions
- `mitra3@demo.com` - LPK Digital Skills Academy

### Industri Accounts
- `industri1@demo.com` - PT Teknologi Maju
- `industri2@demo.com` - PT Digital Innovation
- `industri3@demo.com` - PT Smart Solutions

## 🚀 Method 1: Using Node.js Script (Recommended)

This is the easiest method and handles all relationships automatically.

### Prerequisites
1. Make sure you have `.env.local` file with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

### Run the Script
```bash
node scripts/seed-supabase.js
```

The script will:
- Create all users with proper password hashes
- Create profiles for each user type
- Create courses and link them to Mitra
- Create enrollments linking Talenta to courses
- Create certificates for completed courses
- Create job postings from Industri
- Create job applications from Talenta to jobs

## 🚀 Method 2: Using SQL Script

You can also run the SQL script directly in Supabase SQL Editor.

### Steps

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to **SQL Editor**

2. **Run the Seed Script**
   - Open `supabase/seed_data.sql`
   - Copy the entire contents
   - Paste into SQL Editor
   - Click **Run**

3. **Verify the Data**
   - The script includes verification queries at the end (commented out)
   - Uncomment and run them to check the data

### Important Notes for SQL Method

- The script uses `crypt()` function from `pgcrypto` extension
- Make sure `pgcrypto` extension is enabled in your Supabase project
- The password hash is pre-generated for `password123`
- All foreign key relationships are properly maintained

## 📊 Data Relationships

### Course Enrollments
- **Talenta 1**: Completed "Full Stack Web Development", Enrolled in "Cloud Computing" and "DevOps"
- **Talenta 2**: Completed "Data Science" and "Full Stack Web Development", Enrolled in "UI/UX Design"
- **Talenta 3**: Enrolled in "Mobile App Development" and "Cybersecurity"
- **Talenta 4**: Enrolled in "Digital Marketing" and "Project Management"
- **Talenta 5**: Completed "Full Stack Web Development", Enrolled in "DevOps"

### Certificates Issued
- Certificates are automatically created for all completed enrollments
- Certificate numbers follow format: `CERT-YYYY-XXXXXX`
- AQRF levels are assigned based on course type

### Job Applications
- **Senior Full Stack Developer**: 3 applications (1 accepted, 2 pending)
- **DevOps Engineer**: 2 applications (1 rejected, 1 pending)
- **Frontend Developer**: 2 applications (1 accepted, 1 pending)
- **Data Scientist**: 1 application (pending)
- **Backend Developer**: 2 applications (both pending)
- **UI/UX Designer**: 1 application (pending)

## 🔍 Verification Queries

After seeding, you can run these queries to verify the data:

### Count All Records
```sql
SELECT 
    'Users' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'Talenta Profiles', COUNT(*) FROM public.talenta_profiles
UNION ALL
SELECT 'Mitra Profiles', COUNT(*) FROM public.mitra_profiles
UNION ALL
SELECT 'Industri Profiles', COUNT(*) FROM public.industri_profiles
UNION ALL
SELECT 'Courses', COUNT(*) FROM public.courses
UNION ALL
SELECT 'Enrollments', COUNT(*) FROM public.enrollments
UNION ALL
SELECT 'Certificates', COUNT(*) FROM public.certificates
UNION ALL
SELECT 'Job Postings', COUNT(*) FROM public.job_postings
UNION ALL
SELECT 'Job Applications', COUNT(*) FROM public.job_applications;
```

### View Courses with Enrollment Counts
```sql
SELECT 
    c.id,
    c.title,
    mp.organization_name as provider,
    COUNT(e.id) as enrollment_count,
    COUNT(CASE WHEN e.status = 'COMPLETED' THEN 1 END) as completed_count
FROM public.courses c
JOIN public.mitra_profiles mp ON c.mitra_id = mp.profile_id
LEFT JOIN public.enrollments e ON c.id = e.course_id
GROUP BY c.id, c.title, mp.organization_name
ORDER BY enrollment_count DESC;
```

### View Job Postings with Application Counts
```sql
SELECT 
    jp.id,
    jp.title,
    ip.company_name,
    COUNT(ja.id) as application_count,
    COUNT(CASE WHEN ja.status = 'ACCEPTED' THEN 1 END) as accepted_count,
    COUNT(CASE WHEN ja.status = 'PENDING' THEN 1 END) as pending_count
FROM public.job_postings jp
JOIN public.industri_profiles ip ON jp.industri_id = ip.profile_id
LEFT JOIN public.job_applications ja ON jp.id = ja.job_id
GROUP BY jp.id, jp.title, ip.company_name
ORDER BY application_count DESC;
```

### View Talenta with Their Certificates
```sql
SELECT 
    u.full_name,
    u.email,
    COUNT(c.id) as certificate_count,
    STRING_AGG(c.certificate_number, ', ') as certificates
FROM public.users u
JOIN public.talenta_profiles tp ON u.user_id = tp.user_id
LEFT JOIN public.certificates c ON tp.profile_id = c.talenta_id
WHERE u.user_type = 'TALENTA'
GROUP BY u.user_id, u.full_name, u.email
ORDER BY certificate_count DESC;
```

## 🧹 Clearing Seed Data

If you need to clear the seed data and start fresh:

### Using SQL
```sql
-- WARNING: This will delete ALL data in these tables
TRUNCATE TABLE public.job_applications CASCADE;
TRUNCATE TABLE public.certificates CASCADE;
TRUNCATE TABLE public.enrollments CASCADE;
TRUNCATE TABLE public.job_postings CASCADE;
TRUNCATE TABLE public.courses CASCADE;
TRUNCATE TABLE public.talenta_profiles CASCADE;
TRUNCATE TABLE public.mitra_profiles CASCADE;
TRUNCATE TABLE public.industri_profiles CASCADE;
TRUNCATE TABLE public.users CASCADE;
```

### Using Node.js Script
You can modify `scripts/seed-supabase.js` to add a `--clear` flag that truncates tables before seeding.

## ⚠️ Troubleshooting

### Error: "relation does not exist"
- Make sure you've run all migrations first
- Check that `supabase/migrations/002_fix_users_schema.sql` has been applied

### Error: "duplicate key value violates unique constraint"
- The script uses `ON CONFLICT DO NOTHING` to handle duplicates
- If you see this error, some data already exists
- You can either clear the data first or the script will skip existing records

### Error: "foreign key constraint fails"
- Make sure all migrations are applied in order
- Check that profile tables are created before courses/jobs reference them

### Password Hash Issues
- The SQL script uses a pre-generated bcrypt hash
- The Node.js script generates the hash automatically
- If authentication fails, verify the hash matches `password123`

## 📝 Notes

- All timestamps are set to realistic past dates (days ago)
- Skills are stored as JSONB arrays with structure: `[{name, level, verified}]`
- Certificate numbers are auto-generated with format: `CERT-YYYY-XXXXXX`
- Job applications have realistic status distributions (mostly PENDING, some ACCEPTED/REJECTED)
- All courses are set to `PUBLISHED` status
- All job postings are set to `PUBLISHED` status

## 🎯 Testing Features

With this seed data, you can test:

1. **Talenta Features**
   - View enrolled courses
   - View certificates
   - Apply to jobs
   - View application status
   - Browse available courses

2. **Mitra Features**
   - View created courses
   - See enrollment statistics
   - Manage course participants
   - Issue certificates

3. **Industri Features**
   - View job postings
   - See applications
   - Review candidate profiles
   - Make hiring decisions
   - Search for talent

4. **Cross-Feature Testing**
   - Certificate verification
   - Job application matching
   - Course completion tracking
   - Profile completeness
