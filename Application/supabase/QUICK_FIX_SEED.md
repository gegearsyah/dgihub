# Quick Fix for Seed Data

## The Problem

The seed data was trying to use `id` column from `users` table, but your database uses `user_id` instead.

## Solution

I've updated `seed_learning_data.sql` to automatically detect which column name exists (`user_id` or `id`) and use the correct one.

## How to Use

### Option 1: Use the Updated File (Recommended)

Just run the updated `seed_learning_data.sql` file. It will:
- Automatically detect if your users table has `user_id` or `id` column
- Use the correct column name
- Create profiles and enrollments correctly

### Option 2: Use the Fixed Version

I also created `seed_learning_data_fixed.sql` which is a cleaner version with better error handling.

## Before Running Seed Data

Make sure you have:

1. **Created at least one MITRA user**:
   ```sql
   INSERT INTO public.users (user_id, email, full_name, user_type, password_hash)
   VALUES (
     uuid_generate_v4(),
     'mitra@example.com',
     'Training Provider',
     'MITRA',
     'hashed_password_here'
   );
   ```

2. **Created at least one TALENTA user**:
   ```sql
   INSERT INTO public.users (user_id, email, full_name, user_type, password_hash)
   VALUES (
     uuid_generate_v4(),
     'talenta@example.com',
     'John Doe',
     'TALENTA',
     'hashed_password_here'
   );
   ```

## Run Order

1. ✅ Run `005_add_learning_tables.sql`
2. ✅ Run `006_fix_enrollments_foreign_keys.sql`
3. ✅ Create test users (MITRA and TALENTA)
4. ✅ Run `seed_learning_data.sql` (updated version)

## Verification

After running seed data, verify with:

```sql
-- Check users
SELECT user_id, email, user_type FROM public.users;

-- Check profiles
SELECT * FROM public.mitra_profiles;
SELECT * FROM public.talenta_profiles;

-- Check courses
SELECT kursus_id, title, status FROM public.kursus;

-- Check materials
SELECT materi_id, title, material_type FROM public.materi WHERE kursus_id = '550e8400-e29b-41d4-a716-446655440001';

-- Check enrollments
SELECT * FROM public.enrollments;
```

## What the Updated Seed Data Does

1. **Detects column names** - Automatically uses `user_id` or `id` based on what exists
2. **Creates profiles** - Creates mitra_profiles and talenta_profiles if they don't exist
3. **Inserts courses** - Creates 2 sample courses with materials
4. **Creates enrollment** - Enrolls the TALENTA user in the first course
5. **Marks progress** - Marks first material as completed (20% progress)
6. **Creates workshop** - Sets up a workshop with location data
7. **Registers for workshop** - Registers TALENTA user for the workshop

All with proper error handling and conflict resolution!
