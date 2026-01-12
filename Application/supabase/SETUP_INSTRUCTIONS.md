# Database Setup Instructions

## Step-by-Step Setup Guide

### Step 1: Run Initial Schema Migration

1. Go to Supabase Dashboard → SQL Editor
2. Run `migrations/001_initial_schema.sql`
   - This creates basic tables: users, courses, enrollments, certificates, job_postings

### Step 2: Run Additional Migrations

Run these migrations in order:

1. `migrations/002_fix_users_schema.sql` (if exists)
2. `migrations/003_fix_certificates_schema.sql` (if exists)
3. `migrations/004_add_mitra_organization_name.sql` (if exists)
4. **`migrations/005_add_learning_tables.sql`** ← **IMPORTANT: Run this for learning features**

### Step 3: Create Test Users

Before running seed data, create test users:

```sql
-- Create MITRA user (you'll need to create auth user first via Supabase Auth)
-- Then insert into users table:
INSERT INTO public.users (id, email, full_name, user_type)
VALUES (
  'your-mitra-auth-user-id'::UUID,
  'mitra@example.com',
  'Training Provider',
  'MITRA'
);

-- Create TALENTA user
INSERT INTO public.users (id, email, full_name, user_type)
VALUES (
  'your-talenta-auth-user-id'::UUID,
  'talenta@example.com',
  'John Doe',
  'TALENTA'
);
```

### Step 4: Run Seed Data

After creating users and running all migrations:

1. Run `seed_learning_data.sql` in SQL Editor
2. The script will automatically:
   - Create mitra_profiles and talenta_profiles
   - Insert sample courses and materials
   - Create enrollments
   - Set up workshops

### Step 5: Verify Setup

Run this query to verify everything is set up:

```sql
SELECT 
  'Courses' as table_name, COUNT(*) as count FROM public.kursus
UNION ALL
SELECT 'Materials', COUNT(*) FROM public.materi
UNION ALL
SELECT 'Enrollments', COUNT(*) FROM public.enrollments
UNION ALL
SELECT 'Workshops', COUNT(*) FROM public.workshops;
```

You should see:
- Courses: 2
- Materials: 8
- Enrollments: 1
- Workshops: 1

## Troubleshooting

### Error: "relation kursus does not exist"
**Solution**: Run `migrations/005_add_learning_tables.sql` first

### Error: "foreign key constraint fails"
**Solution**: Make sure you have created users first (Step 3)

### Error: "mitra_profiles does not exist"
**Solution**: The migration will create it automatically, or run:
```sql
CREATE TABLE IF NOT EXISTS public.mitra_profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    organization_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Quick Setup Script

If you want to set everything up at once, run migrations in this order:

1. `001_initial_schema.sql`
2. `005_add_learning_tables.sql` (includes all learning tables)
3. Create your test users
4. `seed_learning_data.sql`

## Testing

After setup:
1. Login as TALENTA user
2. Go to `/talenta/my-courses`
3. You should see "Full Stack Web Development" course
4. Click "Continue Learning"
5. Should navigate to learning page with materials
