# 🔍 Database Errors Checklist

This document lists all potential database errors and their fixes.

## ✅ Fixed Issues

### 1. `user_id` is NULL (FIXED)
**Error:** `null value in column "user_id" of relation "users" violates not-null constraint`

**Cause:** The `user_id` column doesn't have a default UUID generator.

**Fix:** Migration `002_fix_users_schema.sql` now:
- Creates users table with `user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
- Ensures existing `user_id` columns have the default value

---

### 2. Profile Tables Don't Exist (FIXED)
**Error:** `relation "public.mitra_profiles" does not exist`

**Cause:** Foreign keys were being created before profile tables existed.

**Fix:** Migration now creates profile tables BEFORE adding foreign keys.

---

## ⚠️ Potential Issues to Check

### 3. Missing `job_postings` Table Structure
**Potential Error:** `relation "public.job_postings" does not exist` or missing columns

**Check:** The `job_postings` table needs:
- `id` or `job_id` as primary key
- `industri_id` referencing `industri_profiles(profile_id)`
- `title`, `description`, `location`, `city`, `province`
- `salary_min`, `salary_max`
- `status` column (DRAFT, PUBLISHED, CLOSED)
- `created_at`, `updated_at`

**Fix:** Add to migration if missing:
```sql
CREATE TABLE IF NOT EXISTS public.job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    industri_id UUID REFERENCES public.industri_profiles(profile_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    city TEXT,
    province TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'CLOSED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4. Missing `courses` Table Columns
**Potential Error:** Missing `status` column or wrong foreign key

**Check:** The `courses` table needs:
- `id` as primary key (with default UUID)
- `mitra_id` referencing `mitra_profiles(profile_id)` (NOT `users`)
- `title`, `description`, `category`
- `duration_hours`, `skkni_code`
- `status` column (DRAFT, PUBLISHED, ARCHIVED)
- `created_at`, `updated_at`

**Fix:** Already in migration - adds `status` column if missing.

---

### 5. Missing `enrollments` Table Structure
**Potential Error:** Wrong foreign key references

**Check:** The `enrollments` table needs:
- `id` as primary key
- `talenta_id` referencing `talenta_profiles(profile_id)` (NOT `users`)
- `course_id` referencing `courses(id)`
- `status` column
- `enrolled_at`, `completed_at`

**Fix:** Migration updates foreign keys to reference profile tables.

---

### 6. Missing `certificates` Table Structure
**Potential Error:** Wrong foreign key references

**Check:** The `certificates` table needs:
- `id` as primary key
- `talenta_id` referencing `talenta_profiles(profile_id)`
- `mitra_id` referencing `mitra_profiles(profile_id)`
- `course_id` referencing `courses(id)`
- `certificate_number`, `issued_date`, `credential_url`, `aqrf_level`

**Fix:** Migration updates foreign keys to reference profile tables.

---

### 7. Profile Table Inserts Failing
**Potential Error:** Profile insert fails if table doesn't exist or has wrong structure

**Check:** Profile tables need:
- `profile_id` as primary key with default UUID
- `user_id` referencing `users(user_id)`
- Proper columns for each profile type

**Fix:** Migration creates all profile tables with correct structure.

---

### 8. Missing NOT NULL Constraints
**Potential Error:** Required fields are NULL

**Check:** These columns should be NOT NULL:
- `users.email`
- `users.password_hash`
- `users.full_name`
- `users.user_type`
- `users.status`
- `talenta_profiles.user_id`
- `mitra_profiles.user_id`
- `industri_profiles.user_id`

**Fix:** Migration ensures these constraints exist.

---

### 9. Missing Indexes
**Potential Error:** Slow queries

**Check:** These indexes should exist:
- `idx_users_email` on `users(email)`
- `idx_users_user_type` on `users(user_type)`
- `idx_users_status` on `users(status)`
- `idx_talenta_profiles_user_id` on `talenta_profiles(user_id)`
- `idx_mitra_profiles_user_id` on `mitra_profiles(user_id)`
- `idx_industri_profiles_user_id` on `industri_profiles(user_id)`

**Fix:** Migration creates all indexes.

---

## 🧪 Testing Checklist

After running the migration, test these operations:

1. ✅ **User Registration**
   ```bash
   POST /api/v1/auth/register
   ```
   - Should create user with auto-generated `user_id`
   - Should create corresponding profile

2. ✅ **User Login**
   ```bash
   POST /api/v1/auth/login
   ```
   - Should find user by email
   - Should verify password_hash
   - Should update last_login_at

3. ✅ **Create Course (Mitra)**
   ```bash
   POST /api/v1/mitra/courses
   ```
   - Should find mitra_profile
   - Should create course with mitra_id

4. ✅ **Create Job (Industri)**
   ```bash
   POST /api/v1/industri/jobs
   ```
   - Should find industri_profile
   - Should create job_posting with industri_id

5. ✅ **Get My Courses (Talenta)**
   ```bash
   GET /api/v1/talenta/my-courses
   ```
   - Should find talenta_profile
   - Should query enrollments

---

## 🔧 How to Verify Migration Worked

Run this SQL in Supabase SQL Editor:

```sql
-- Check users table structure
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Check if user_id has default
SELECT column_name, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users' 
  AND column_name = 'user_id';

-- Check profile tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('talenta_profiles', 'mitra_profiles', 'industri_profiles');

-- Check foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('courses', 'enrollments', 'certificates', 'job_postings');
```

---

## 📝 Next Steps

1. Run the updated migration `002_fix_users_schema.sql`
2. Verify the structure with the SQL queries above
3. Test user registration
4. Test other endpoints
5. Report any remaining errors

---

**All errors should be fixed after running the updated migration!** ✅

