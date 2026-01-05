-- ============================================================================
-- DGIHub Platform - Comprehensive Seed Data for Supabase
-- This script creates interconnected data for all features
-- Run this in Supabase SQL Editor after running migrations
-- ============================================================================

-- Clear existing data (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE public.job_applications CASCADE;
-- TRUNCATE TABLE public.certificates CASCADE;
-- TRUNCATE TABLE public.enrollments CASCADE;
-- TRUNCATE TABLE public.job_postings CASCADE;
-- TRUNCATE TABLE public.courses CASCADE;
-- TRUNCATE TABLE public.talenta_profiles CASCADE;
-- TRUNCATE TABLE public.mitra_profiles CASCADE;
-- TRUNCATE TABLE public.industri_profiles CASCADE;
-- TRUNCATE TABLE public.users CASCADE;

-- ============================================================================
-- 1. CREATE USERS (All Types)
-- ============================================================================

-- Password hash for 'password123' (bcrypt with salt rounds 10)
-- All demo accounts use this password
DO $$
DECLARE
    default_password_hash TEXT := '$2a$10$4.0qmZr8uqmmkKPAJYX.aeCnk4wbWR54tz2Yrb8EeJ9dNdwKwXHSu';
    -- This is the bcrypt hash for 'password123'
    -- Generated with: bcrypt.hashSync('password123', 10)
BEGIN
    
    -- Talenta Users (5 users)
    INSERT INTO public.users (user_id, email, password_hash, full_name, user_type, status, email_verified, profile_complete, created_at)
    VALUES
        (gen_random_uuid(), 'talenta1@demo.com', default_password_hash, 'Budi Santoso', 'TALENTA', 'ACTIVE', true, true, NOW() - INTERVAL '30 days'),
        (gen_random_uuid(), 'talenta2@demo.com', default_password_hash, 'Siti Nurhaliza', 'TALENTA', 'ACTIVE', true, true, NOW() - INTERVAL '25 days'),
        (gen_random_uuid(), 'talenta3@demo.com', default_password_hash, 'Ahmad Fauzi', 'TALENTA', 'ACTIVE', true, true, NOW() - INTERVAL '20 days'),
        (gen_random_uuid(), 'talenta4@demo.com', default_password_hash, 'Dewi Sartika', 'TALENTA', 'VERIFIED', true, false, NOW() - INTERVAL '15 days'),
        (gen_random_uuid(), 'talenta5@demo.com', default_password_hash, 'Rizki Pratama', 'TALENTA', 'ACTIVE', true, true, NOW() - INTERVAL '10 days')
    ON CONFLICT (email) DO NOTHING;
    
    -- Mitra Users (3 users)
    INSERT INTO public.users (user_id, email, password_hash, full_name, user_type, status, email_verified, profile_complete, created_at)
    VALUES
        (gen_random_uuid(), 'mitra1@demo.com', default_password_hash, 'LPK Teknologi Indonesia', 'MITRA', 'ACTIVE', true, true, NOW() - INTERVAL '60 days'),
        (gen_random_uuid(), 'mitra2@demo.com', default_password_hash, 'LPK Cloud Solutions', 'MITRA', 'ACTIVE', true, true, NOW() - INTERVAL '50 days'),
        (gen_random_uuid(), 'mitra3@demo.com', default_password_hash, 'LPK Digital Skills Academy', 'MITRA', 'ACTIVE', true, true, NOW() - INTERVAL '40 days')
    ON CONFLICT (email) DO NOTHING;
    
    -- Industri Users (3 users)
    INSERT INTO public.users (user_id, email, password_hash, full_name, user_type, status, email_verified, profile_complete, created_at)
    VALUES
        (gen_random_uuid(), 'industri1@demo.com', default_password_hash, 'PT Teknologi Maju', 'INDUSTRI', 'ACTIVE', true, true, NOW() - INTERVAL '45 days'),
        (gen_random_uuid(), 'industri2@demo.com', default_password_hash, 'PT Digital Innovation', 'INDUSTRI', 'ACTIVE', true, true, NOW() - INTERVAL '35 days'),
        (gen_random_uuid(), 'industri3@demo.com', default_password_hash, 'PT Smart Solutions', 'INDUSTRI', 'ACTIVE', true, true, NOW() - INTERVAL '25 days')
    ON CONFLICT (email) DO NOTHING;
END $$;

-- ============================================================================
-- 2. CREATE PROFILES
-- ============================================================================

-- Talenta Profiles
-- Note: Only inserting columns that exist in the current schema (nik, phone)
-- If you need city, province, skills, aqrf_level, add them to the migration first
INSERT INTO public.talenta_profiles (user_id, nik, phone, created_at)
SELECT 
    u.user_id,
    CASE 
        WHEN u.email = 'talenta1@demo.com' THEN '3201010101010001'
        WHEN u.email = 'talenta2@demo.com' THEN '3201010101010002'
        WHEN u.email = 'talenta3@demo.com' THEN '3201010101010003'
        WHEN u.email = 'talenta4@demo.com' THEN '3201010101010004'
        WHEN u.email = 'talenta5@demo.com' THEN '3201010101010005'
    END,
    CASE 
        WHEN u.email = 'talenta1@demo.com' THEN '081234567890'
        WHEN u.email = 'talenta2@demo.com' THEN '081234567891'
        WHEN u.email = 'talenta3@demo.com' THEN '081234567892'
        WHEN u.email = 'talenta4@demo.com' THEN '081234567893'
        WHEN u.email = 'talenta5@demo.com' THEN '081234567894'
    END,
    u.created_at
FROM public.users u
WHERE u.user_type = 'TALENTA'
ON CONFLICT (user_id) DO NOTHING;

-- Mitra Profiles
-- Note: Only inserting columns that exist in the current schema
-- The migration only creates basic profile tables, additional columns need to be added via migration
INSERT INTO public.mitra_profiles (user_id, created_at)
SELECT 
    u.user_id,
    u.created_at
FROM public.users u
WHERE u.user_type = 'MITRA'
ON CONFLICT (user_id) DO NOTHING;

-- Industri Profiles
-- Note: Only inserting columns that exist in the current schema
-- The migration only creates basic profile tables, additional columns need to be added via migration
INSERT INTO public.industri_profiles (user_id, created_at)
SELECT 
    u.user_id,
    u.created_at
FROM public.users u
WHERE u.user_type = 'INDUSTRI'
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- 3. CREATE COURSES (by Mitra)
-- ============================================================================

-- Create courses for each Mitra (using user email to match since organization_name doesn't exist yet)
INSERT INTO public.courses (mitra_id, title, description, category, duration_hours, skkni_code, status, created_at)
SELECT 
    mp.profile_id,
    course_data.title,
    course_data.description,
    course_data.category,
    course_data.duration_hours,
    course_data.skkni_code,
    'PUBLISHED',
    NOW() - (course_data.days_ago || ' days')::INTERVAL
FROM public.mitra_profiles mp
JOIN public.users u ON mp.user_id = u.user_id
CROSS JOIN (
    VALUES
        -- Mitra 1 Courses (mitra1@demo.com)
        ('mitra1@demo.com', 'Full Stack Web Development', 
         'Comprehensive course covering HTML, CSS, JavaScript, React, Node.js, and database management. Learn to build modern web applications from scratch.', 
         'Web Development', 120, 'SKKNI-IT-2024-001', 30),
        ('mitra1@demo.com', 'Cloud Computing Fundamentals', 
         'Introduction to cloud computing concepts, AWS services, and deployment strategies. Perfect for beginners.', 
         'Cloud Computing', 80, 'SKKNI-IT-2024-002', 25),
        ('mitra1@demo.com', 'Mobile App Development', 
         'Learn to build native and cross-platform mobile applications using React Native and Flutter.', 
         'Mobile Development', 100, 'SKKNI-IT-2024-003', 20),
        
        -- Mitra 2 Courses (mitra2@demo.com)
        ('mitra2@demo.com', 'DevOps Engineering', 
         'Master CI/CD pipelines, containerization with Docker, Kubernetes orchestration, and infrastructure as code.', 
         'DevOps', 140, 'SKKNI-IT-2024-004', 35),
        ('mitra2@demo.com', 'Data Science & Analytics', 
         'Learn Python for data analysis, machine learning basics, and data visualization techniques.', 
         'Data Science', 100, 'SKKNI-IT-2024-005', 28),
        ('mitra2@demo.com', 'Cybersecurity Fundamentals', 
         'Introduction to network security, ethical hacking, and security best practices.', 
         'Cybersecurity', 90, 'SKKNI-IT-2024-006', 22),
        
        -- Mitra 3 Courses (mitra3@demo.com)
        ('mitra3@demo.com', 'UI/UX Design', 
         'Learn design principles, user research, prototyping, and design tools like Figma and Adobe XD.', 
         'Design', 80, 'SKKNI-IT-2024-007', 40),
        ('mitra3@demo.com', 'Digital Marketing', 
         'Master SEO, social media marketing, content creation, and analytics.', 
         'Marketing', 60, 'SKKNI-IT-2024-008', 18),
        ('mitra3@demo.com', 'Project Management', 
         'Learn Agile, Scrum, project planning, and team management skills.', 
         'Management', 70, 'SKKNI-IT-2024-009', 15)
) AS course_data(email, title, description, category, duration_hours, skkni_code, days_ago)
WHERE u.email = course_data.email
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. CREATE ENROLLMENTS (Talenta enrolled in Courses)
-- ============================================================================

INSERT INTO public.enrollments (talenta_id, course_id, status, enrolled_at, completed_at)
SELECT 
    tp.profile_id,
    c.id,
    enrollment_data.status,
    NOW() - (enrollment_data.days_ago || ' days')::INTERVAL,
    CASE 
        WHEN enrollment_data.status = 'COMPLETED' 
        THEN NOW() - (enrollment_data.days_ago - 5 || ' days')::INTERVAL
        ELSE NULL
    END
FROM public.talenta_profiles tp
JOIN public.users u ON tp.user_id = u.user_id
CROSS JOIN public.courses c
CROSS JOIN (
    VALUES
        -- Talenta 1 enrollments
        ('talenta1@demo.com', 'Full Stack Web Development', 'COMPLETED', 20),
        ('talenta1@demo.com', 'Cloud Computing Fundamentals', 'ENROLLED', 10),
        ('talenta1@demo.com', 'DevOps Engineering', 'ENROLLED', 5),
        
        -- Talenta 2 enrollments
        ('talenta2@demo.com', 'Data Science & Analytics', 'COMPLETED', 15),
        ('talenta2@demo.com', 'Full Stack Web Development', 'COMPLETED', 25),
        ('talenta2@demo.com', 'UI/UX Design', 'ENROLLED', 8),
        
        -- Talenta 3 enrollments
        ('talenta3@demo.com', 'Mobile App Development', 'ENROLLED', 12),
        ('talenta3@demo.com', 'Cybersecurity Fundamentals', 'ENROLLED', 6),
        
        -- Talenta 4 enrollments
        ('talenta4@demo.com', 'Digital Marketing', 'ENROLLED', 3),
        ('talenta4@demo.com', 'Project Management', 'ENROLLED', 1),
        
        -- Talenta 5 enrollments
        ('talenta5@demo.com', 'Full Stack Web Development', 'COMPLETED', 18),
        ('talenta5@demo.com', 'DevOps Engineering', 'ENROLLED', 7)
) AS enrollment_data(email, course_title, status, days_ago)
WHERE u.email = enrollment_data.email
  AND c.title = enrollment_data.course_title
ON CONFLICT (talenta_id, course_id) DO NOTHING;

-- ============================================================================
-- 5. CREATE CERTIFICATES (Issued to Talenta for completed courses)
-- ============================================================================

INSERT INTO public.certificates (talenta_id, course_id, mitra_id, certificate_number, issued_date, aqrf_level, created_at)
SELECT 
    e.talenta_id,
    e.course_id,
    c.mitra_id,
    'CERT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(ROW_NUMBER() OVER ()::TEXT, 6, '0'),
    e.completed_at,
    CASE 
        WHEN c.title LIKE '%Full Stack%' THEN '4'
        WHEN c.title LIKE '%Data Science%' THEN '5'
        WHEN c.title LIKE '%DevOps%' THEN '5'
        WHEN c.title LIKE '%Cloud%' THEN '4'
        ELSE '3'
    END,
    e.completed_at
FROM public.enrollments e
JOIN public.courses c ON e.course_id = c.id
WHERE e.status = 'COMPLETED'
  AND e.completed_at IS NOT NULL
ON CONFLICT (certificate_number) DO NOTHING;

-- ============================================================================
-- 6. CREATE JOB POSTINGS (by Industri)
-- ============================================================================

-- Create job postings for each Industri (using user email to match since company_name doesn't exist yet)
INSERT INTO public.job_postings (industri_id, title, description, location, city, province, salary_min, salary_max, status, created_at)
SELECT 
    ip.profile_id,
    job_data.title,
    job_data.description,
    job_data.location,
    job_data.city,
    job_data.province,
    job_data.salary_min,
    job_data.salary_max,
    'PUBLISHED',
    NOW() - (job_data.days_ago || ' days')::INTERVAL
FROM public.industri_profiles ip
JOIN public.users u ON ip.user_id = u.user_id
CROSS JOIN (
    VALUES
        -- Industri 1 Jobs (industri1@demo.com)
        ('industri1@demo.com', 'Senior Full Stack Developer', 
         'We are looking for an experienced Full Stack Developer to join our team. Must have experience with React, Node.js, and PostgreSQL.', 
         'Jl. Sudirman No. 123', 'Jakarta', 'DKI Jakarta', 15000000, 25000000, 20),
        ('industri1@demo.com', 'DevOps Engineer', 
         'Seeking a DevOps Engineer with experience in AWS, Docker, and Kubernetes. CI/CD pipeline experience required.', 
         'Jl. Sudirman No. 123', 'Jakarta', 'DKI Jakarta', 12000000, 20000000, 15),
        
        -- Industri 2 Jobs (industri2@demo.com)
        ('industri2@demo.com', 'Frontend Developer', 
         'Join our team as a Frontend Developer. Experience with React, Vue.js, or Angular required.', 
         'Jl. Dago No. 456', 'Bandung', 'Jawa Barat', 10000000, 18000000, 18),
        ('industri2@demo.com', 'Data Scientist', 
         'Looking for a Data Scientist with Python and machine learning experience. Must have portfolio of projects.', 
         'Jl. Dago No. 456', 'Bandung', 'Jawa Barat', 15000000, 25000000, 12),
        
        -- Industri 3 Jobs (industri3@demo.com)
        ('industri3@demo.com', 'Backend Developer', 
         'Backend Developer position with Java or Node.js experience. Microservices architecture knowledge preferred.', 
         'Jl. Pemuda No. 789', 'Surabaya', 'Jawa Timur', 11000000, 19000000, 10),
        ('industri3@demo.com', 'UI/UX Designer', 
         'Creative UI/UX Designer needed. Must be proficient in Figma and have a strong portfolio.', 
         'Jl. Pemuda No. 789', 'Surabaya', 'Jawa Timur', 8000000, 15000000, 8)
) AS job_data(email, title, description, location, city, province, salary_min, salary_max, days_ago)
WHERE u.email = job_data.email
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. CREATE JOB APPLICATIONS (Talenta applying to Jobs)
-- ============================================================================

INSERT INTO public.job_applications (job_id, talenta_id, status, applied_at, reviewed_at)
SELECT 
    jp.id,
    tp.profile_id,
    app_data.status,
    NOW() - (app_data.days_ago || ' days')::INTERVAL,
    CASE 
        WHEN app_data.status IN ('ACCEPTED', 'REJECTED') 
        THEN NOW() - (app_data.days_ago - 2 || ' days')::INTERVAL
        ELSE NULL
    END
FROM public.job_postings jp
JOIN public.industri_profiles ip ON jp.industri_id = ip.profile_id
JOIN public.users industri_user ON ip.user_id = industri_user.user_id
CROSS JOIN public.talenta_profiles tp
JOIN public.users u ON tp.user_id = u.user_id
CROSS JOIN (
    VALUES
        -- Applications for Senior Full Stack Developer (industri1@demo.com)
        ('industri1@demo.com', 'Senior Full Stack Developer', 'talenta1@demo.com', 'PENDING', 5),
        ('industri1@demo.com', 'Senior Full Stack Developer', 'talenta2@demo.com', 'ACCEPTED', 7),
        ('industri1@demo.com', 'Senior Full Stack Developer', 'talenta5@demo.com', 'PENDING', 3),
        
        -- Applications for DevOps Engineer (industri1@demo.com)
        ('industri1@demo.com', 'DevOps Engineer', 'talenta1@demo.com', 'PENDING', 4),
        ('industri1@demo.com', 'DevOps Engineer', 'talenta2@demo.com', 'REJECTED', 6),
        
        -- Applications for Frontend Developer (industri2@demo.com)
        ('industri2@demo.com', 'Frontend Developer', 'talenta2@demo.com', 'ACCEPTED', 8),
        ('industri2@demo.com', 'Frontend Developer', 'talenta4@demo.com', 'PENDING', 2),
        
        -- Applications for Data Scientist (industri2@demo.com)
        ('industri2@demo.com', 'Data Scientist', 'talenta2@demo.com', 'PENDING', 5),
        
        -- Applications for Backend Developer (industri3@demo.com)
        ('industri3@demo.com', 'Backend Developer', 'talenta3@demo.com', 'PENDING', 4),
        ('industri3@demo.com', 'Backend Developer', 'talenta5@demo.com', 'PENDING', 1),
        
        -- Applications for UI/UX Designer (industri3@demo.com)
        ('industri3@demo.com', 'UI/UX Designer', 'talenta4@demo.com', 'PENDING', 3)
) AS app_data(industri_email, job_title, talenta_email, status, days_ago)
WHERE industri_user.email = app_data.industri_email
  AND jp.title = app_data.job_title
  AND u.email = app_data.talenta_email
ON CONFLICT (job_id, talenta_id) DO NOTHING;

-- ============================================================================
-- 8. UPDATE USER LAST LOGIN (for realism)
-- ============================================================================

UPDATE public.users
SET last_login_at = NOW() - (RANDOM() * 7 || ' days')::INTERVAL
WHERE last_login_at IS NULL;

-- ============================================================================
-- VERIFICATION QUERIES (Run these to verify the data)
-- ============================================================================

-- View all users with their profiles
-- SELECT 
--     u.user_id,
--     u.email,
--     u.full_name,
--     u.user_type,
--     u.status,
--     CASE 
--         WHEN u.user_type = 'TALENTA' THEN tp.phone
--         WHEN u.user_type = 'MITRA' THEN mp.phone
--         WHEN u.user_type = 'INDUSTRI' THEN ip.phone
--     END as phone
-- FROM public.users u
-- LEFT JOIN public.talenta_profiles tp ON u.user_id = tp.user_id
-- LEFT JOIN public.mitra_profiles mp ON u.user_id = mp.user_id
-- LEFT JOIN public.industri_profiles ip ON u.user_id = ip.user_id
-- ORDER BY u.user_type, u.email;

-- View courses with enrollment counts
-- SELECT 
--     c.id,
--     c.title,
--     mp.organization_name as provider,
--     COUNT(e.id) as enrollment_count,
--     COUNT(CASE WHEN e.status = 'COMPLETED' THEN 1 END) as completed_count
-- FROM public.courses c
-- JOIN public.mitra_profiles mp ON c.mitra_id = mp.profile_id
-- LEFT JOIN public.enrollments e ON c.id = e.course_id
-- GROUP BY c.id, c.title, mp.organization_name
-- ORDER BY enrollment_count DESC;

-- View job postings with application counts
-- SELECT 
--     jp.id,
--     jp.title,
--     ip.company_name,
--     COUNT(ja.id) as application_count,
--     COUNT(CASE WHEN ja.status = 'ACCEPTED' THEN 1 END) as accepted_count
-- FROM public.job_postings jp
-- JOIN public.industri_profiles ip ON jp.industri_id = ip.profile_id
-- LEFT JOIN public.job_applications ja ON jp.id = ja.job_id
-- GROUP BY jp.id, jp.title, ip.company_name
-- ORDER BY application_count DESC;

-- ============================================================================
-- SUMMARY
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Seed data created successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Summary:';
    RAISE NOTICE '  - Users: %', (SELECT COUNT(*) FROM public.users);
    RAISE NOTICE '  - Talenta Profiles: %', (SELECT COUNT(*) FROM public.talenta_profiles);
    RAISE NOTICE '  - Mitra Profiles: %', (SELECT COUNT(*) FROM public.mitra_profiles);
    RAISE NOTICE '  - Industri Profiles: %', (SELECT COUNT(*) FROM public.industri_profiles);
    RAISE NOTICE '  - Courses: %', (SELECT COUNT(*) FROM public.courses);
    RAISE NOTICE '  - Enrollments: %', (SELECT COUNT(*) FROM public.enrollments);
    RAISE NOTICE '  - Certificates: %', (SELECT COUNT(*) FROM public.certificates);
    RAISE NOTICE '  - Job Postings: %', (SELECT COUNT(*) FROM public.job_postings);
    RAISE NOTICE '  - Job Applications: %', (SELECT COUNT(*) FROM public.job_applications);
    RAISE NOTICE '';
    RAISE NOTICE '🔑 Demo Accounts (password: password123):';
    RAISE NOTICE '  Talenta: talenta1@demo.com, talenta2@demo.com, talenta3@demo.com';
    RAISE NOTICE '  Mitra: mitra1@demo.com, mitra2@demo.com, mitra3@demo.com';
    RAISE NOTICE '  Industri: industri1@demo.com, industri2@demo.com, industri3@demo.com';
END $$;

