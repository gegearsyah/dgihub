-- Quick Script to Create Test Users
-- Run this BEFORE running seed_learning_data.sql

-- ============================================================================
-- CREATE TEST USERS
-- ============================================================================

-- Note: In production, users are created through the registration API
-- This is just for testing/development

-- Create MITRA user
INSERT INTO public.users (
  user_id,
  email,
  full_name,
  user_type,
  password_hash,
  status,
  email_verified
) VALUES (
  uuid_generate_v4(),
  'mitra@test.com',
  'Sample Training Provider',
  'MITRA',
  '$2a$10$dummy_hash_for_testing_only', -- In real app, use proper bcrypt hash
  'ACTIVE',
  true
)
ON CONFLICT (email) DO UPDATE
SET full_name = EXCLUDED.full_name,
    user_type = EXCLUDED.user_type;

-- Create TALENTA user
INSERT INTO public.users (
  user_id,
  email,
  full_name,
  user_type,
  password_hash,
  status,
  email_verified
) VALUES (
  uuid_generate_v4(),
  'talenta@test.com',
  'John Doe',
  'TALENTA',
  '$2a$10$dummy_hash_for_testing_only', -- In real app, use proper bcrypt hash
  'ACTIVE',
  true
)
ON CONFLICT (email) DO UPDATE
SET full_name = EXCLUDED.full_name,
    user_type = EXCLUDED.user_type;

-- ============================================================================
-- VERIFY USERS CREATED
-- ============================================================================

SELECT 
  user_id,
  email,
  full_name,
  user_type,
  status
FROM public.users
WHERE email IN ('mitra@test.com', 'talenta@test.com');

-- ============================================================================
-- NEXT STEPS
-- ============================================================================
-- After running this, you can run seed_learning_data.sql
-- The seed script will automatically:
-- 1. Create mitra_profiles and talenta_profiles
-- 2. Create courses and materials
-- 3. Create enrollments
-- 4. Set up workshops
