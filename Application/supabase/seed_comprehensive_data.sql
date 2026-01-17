-- ============================================================================
-- DGIHub Platform - Comprehensive Seed Data
-- This script creates interconnected data for ALL features
-- IMPORTANT: Run all migrations FIRST before running this seed data
-- ============================================================================
-- 
-- Course Visibility Rules:
-- - Talenta can only see courses with status = 'PUBLISHED'
-- - Mitra can see all their courses (DRAFT, PUBLISHED, etc.)
-- - Courses must have at least one material to be useful
-- - Courses should have proper delivery_mode, price, category, etc.
--
-- ============================================================================

DO $$
DECLARE
    v_mitra_user_id UUID;
    v_mitra_profile_id UUID;
    v_talenta_user_id UUID;
    v_talenta_profile_id UUID;
    v_industri_user_id UUID;
    v_industri_profile_id UUID;
    v_user_id_column TEXT;
    v_kursus_id_1 UUID := '550e8400-e29b-41d4-a716-446655440001'::UUID;
    v_kursus_id_2 UUID := '550e8400-e29b-41d4-a716-446655440002'::UUID;
    v_kursus_id_3 UUID := '550e8400-e29b-41d4-a716-446655440003'::UUID;
    v_kursus_id_4 UUID := '550e8400-e29b-41d4-a716-446655440004'::UUID;
    v_kursus_id_5 UUID := '550e8400-e29b-41d4-a716-446655440005'::UUID;
    v_kursus_id_6 UUID := '550e8400-e29b-41d4-a716-446655440006'::UUID;
    v_kursus_id_7 UUID := '550e8400-e29b-41d4-a716-446655440007'::UUID;
    v_kursus_id_8 UUID := '550e8400-e29b-41d4-a716-446655440008'::UUID;
    v_kursus_id_9 UUID := '550e8400-e29b-41d4-a716-446655440009'::UUID;
BEGIN
    -- ============================================================================
    -- 1. DETECT COLUMN NAMES
    -- ============================================================================
    SELECT column_name INTO v_user_id_column
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name IN ('user_id', 'id')
    ORDER BY CASE WHEN column_name = 'user_id' THEN 1 ELSE 2 END
    LIMIT 1;

    -- ============================================================================
    -- 2. GET OR CREATE MITRA USER AND PROFILE (mitra1@demo.com)
    -- ============================================================================
    -- First try to find mitra1@demo.com specifically
    IF v_user_id_column = 'user_id' THEN
        SELECT user_id INTO v_mitra_user_id 
        FROM public.users 
        WHERE email = 'mitra1@demo.com' AND user_type = 'MITRA'
        LIMIT 1;
    ELSE
        SELECT id INTO v_mitra_user_id 
        FROM public.users 
        WHERE email = 'mitra1@demo.com' AND user_type = 'MITRA'
        LIMIT 1;
    END IF;

    -- If mitra1@demo.com doesn't exist, try any MITRA user
    IF v_mitra_user_id IS NULL THEN
        IF v_user_id_column = 'user_id' THEN
            SELECT user_id INTO v_mitra_user_id 
            FROM public.users 
            WHERE user_type = 'MITRA' 
            LIMIT 1;
        ELSE
            SELECT id INTO v_mitra_user_id 
            FROM public.users 
            WHERE user_type = 'MITRA' 
            LIMIT 1;
        END IF;
    END IF;

    IF v_mitra_user_id IS NULL THEN
        -- Create mitra1@demo.com user
        INSERT INTO public.users (email, password_hash, full_name, user_type, status, email_verified, profile_complete)
        VALUES (
            'mitra1@demo.com',
            '$2a$10$4.0qmZr8uqmmkKPAJYX.aeCnk4wbWR54tz2Yrb8EeJ9dNdwKwXHSu', -- password123
            'LPK Teknologi Indonesia',
            'MITRA',
            'ACTIVE',
            true,
            true
        )
        RETURNING 
            CASE WHEN v_user_id_column = 'user_id' THEN user_id ELSE id END
        INTO v_mitra_user_id;
        
        RAISE NOTICE 'Created Mitra user (mitra1@demo.com): %', v_mitra_user_id;
    END IF;

    -- Get or create Mitra profile
    SELECT profile_id INTO v_mitra_profile_id
    FROM public.mitra_profiles
    WHERE user_id = v_mitra_user_id
    LIMIT 1;

    IF v_mitra_profile_id IS NULL THEN
        INSERT INTO public.mitra_profiles (
            user_id, organization_name,
            lpk_license_number, bnsp_accreditation_number,
            director_name, field_of_expertise,
            number_of_instructors, facilities, training_programs,
            bank_account_name, bank_account_number, bank_name,
            verification_status
        )
        VALUES (
            v_mitra_user_id,
            'LPK Teknologi Indonesia',
            'LPK-2024-001',
            'BNSP-2024-001',
            'Dr. Ahmad Wijaya, S.T., M.T.',
            'Teknologi Informasi, Pengembangan Perangkat Lunak, Cloud Computing',
            15,
            'Laboratorium komputer dengan 50 unit PC, ruang kelas ber-AC, perpustakaan digital, WiFi high-speed',
            'Full Stack Web Development, Cloud Computing, Mobile App Development, Data Science, DevOps, Cybersecurity',
            'LPK Teknologi Indonesia',
            '1234567890',
            'Bank Mandiri',
            'VERIFIED'
        )
        RETURNING profile_id INTO v_mitra_profile_id;
        
        RAISE NOTICE 'Created Mitra profile: %', v_mitra_profile_id;
    ELSE
        -- Update all fields to ensure complete data
        UPDATE public.mitra_profiles
        SET 
            organization_name = COALESCE(organization_name, 'LPK Teknologi Indonesia'),
            lpk_license_number = COALESCE(lpk_license_number, 'LPK-2024-001'),
            bnsp_accreditation_number = COALESCE(bnsp_accreditation_number, 'BNSP-2024-001'),
            director_name = COALESCE(director_name, 'Dr. Ahmad Wijaya, S.T., M.T.'),
            field_of_expertise = COALESCE(field_of_expertise, 'Teknologi Informasi, Pengembangan Perangkat Lunak, Cloud Computing'),
            number_of_instructors = COALESCE(number_of_instructors, 15),
            facilities = COALESCE(facilities, 'Laboratorium komputer dengan 50 unit PC, ruang kelas ber-AC, perpustakaan digital, WiFi high-speed'),
            training_programs = COALESCE(training_programs, 'Full Stack Web Development, Cloud Computing, Mobile App Development, Data Science, DevOps, Cybersecurity'),
            bank_account_name = COALESCE(bank_account_name, 'LPK Teknologi Indonesia'),
            bank_account_number = COALESCE(bank_account_number, '1234567890'),
            bank_name = COALESCE(bank_name, 'Bank Mandiri'),
            verification_status = COALESCE(verification_status, 'VERIFIED')
        WHERE profile_id = v_mitra_profile_id;
        
        RAISE NOTICE 'Updated Mitra profile with complete data: %', v_mitra_profile_id;
    END IF;

    -- ============================================================================
    -- 3. GET OR CREATE TALENTA USER AND PROFILE (talenta1@demo.com)
    -- ============================================================================
    -- First try to find talenta1@demo.com specifically
    IF v_user_id_column = 'user_id' THEN
        SELECT user_id INTO v_talenta_user_id 
        FROM public.users 
        WHERE email = 'talenta1@demo.com' AND user_type = 'TALENTA'
        LIMIT 1;
    ELSE
        SELECT id INTO v_talenta_user_id 
        FROM public.users 
        WHERE email = 'talenta1@demo.com' AND user_type = 'TALENTA'
        LIMIT 1;
    END IF;

    -- If talenta1@demo.com doesn't exist, try any TALENTA user
    IF v_talenta_user_id IS NULL THEN
        IF v_user_id_column = 'user_id' THEN
            SELECT user_id INTO v_talenta_user_id 
            FROM public.users 
            WHERE user_type = 'TALENTA' 
            LIMIT 1;
        ELSE
            SELECT id INTO v_talenta_user_id 
            FROM public.users 
            WHERE user_type = 'TALENTA' 
            LIMIT 1;
        END IF;
    END IF;

    IF v_talenta_user_id IS NULL THEN
        INSERT INTO public.users (email, password_hash, full_name, user_type, status, email_verified, profile_complete)
        VALUES (
            'talenta1@demo.com',
            '$2a$10$4.0qmZr8uqmmkKPAJYX.aeCnk4wbWR54tz2Yrb8EeJ9dNdwKwXHSu', -- password123
            'Budi Santoso',
            'TALENTA',
            'ACTIVE',
            true,
            true
        )
        RETURNING 
            CASE WHEN v_user_id_column = 'user_id' THEN user_id ELSE id END
        INTO v_talenta_user_id;
        
        RAISE NOTICE 'Created Talenta user (talenta1@demo.com): %', v_talenta_user_id;
    END IF;

    -- Get or create Talenta profile
    SELECT profile_id INTO v_talenta_profile_id
    FROM public.talenta_profiles
    WHERE user_id = v_talenta_user_id
    LIMIT 1;

    IF v_talenta_profile_id IS NULL THEN
        INSERT INTO public.talenta_profiles (user_id, nik, phone)
        VALUES (v_talenta_user_id, '3201010101010001', '081234567890')
        RETURNING profile_id INTO v_talenta_profile_id;
        
        RAISE NOTICE 'Created Talenta profile: %', v_talenta_profile_id;
    ELSE
        -- Update to ensure complete data
        UPDATE public.talenta_profiles
        SET 
            nik = COALESCE(nik, '3201010101010001'),
            phone = COALESCE(phone, '081234567890')
        WHERE profile_id = v_talenta_profile_id;
    END IF;

    -- ============================================================================
    -- 4. GET OR CREATE INDUSTRI USER AND PROFILE (industri1@demo.com)
    -- ============================================================================
    -- First try to find industri1@demo.com specifically
    IF v_user_id_column = 'user_id' THEN
        SELECT user_id INTO v_industri_user_id 
        FROM public.users 
        WHERE email = 'industri1@demo.com' AND user_type = 'INDUSTRI'
        LIMIT 1;
    ELSE
        SELECT id INTO v_industri_user_id 
        FROM public.users 
        WHERE email = 'industri1@demo.com' AND user_type = 'INDUSTRI'
        LIMIT 1;
    END IF;

    -- If industri1@demo.com doesn't exist, try any INDUSTRI user
    IF v_industri_user_id IS NULL THEN
        IF v_user_id_column = 'user_id' THEN
            SELECT user_id INTO v_industri_user_id 
            FROM public.users 
            WHERE user_type = 'INDUSTRI' 
            LIMIT 1;
        ELSE
            SELECT id INTO v_industri_user_id 
            FROM public.users 
            WHERE user_type = 'INDUSTRI' 
            LIMIT 1;
        END IF;
    END IF;

    IF v_industri_user_id IS NULL THEN
        INSERT INTO public.users (email, password_hash, full_name, user_type, status, email_verified, profile_complete)
        VALUES (
            'industri1@demo.com',
            '$2a$10$4.0qmZr8uqmmkKPAJYX.aeCnk4wbWR54tz2Yrb8EeJ9dNdwKwXHSu', -- password123
            'PT Teknologi Maju',
            'INDUSTRI',
            'ACTIVE',
            true,
            true
        )
        RETURNING 
            CASE WHEN v_user_id_column = 'user_id' THEN user_id ELSE id END
        INTO v_industri_user_id;
        
        RAISE NOTICE 'Created Industri user (industri1@demo.com): %', v_industri_user_id;
    END IF;

    -- Get or create Industri profile
    SELECT profile_id INTO v_industri_profile_id
    FROM public.industri_profiles
    WHERE user_id = v_industri_user_id
    LIMIT 1;

    IF v_industri_profile_id IS NULL THEN
        INSERT INTO public.industri_profiles (user_id)
        VALUES (v_industri_user_id)
        RETURNING profile_id INTO v_industri_profile_id;
        
        RAISE NOTICE 'Created Industri profile: %', v_industri_profile_id;
    END IF;
    
    -- Ensure user's full_name is set (company name is stored in users.full_name)
    UPDATE public.users
    SET full_name = COALESCE(full_name, 'PT Teknologi Maju')
    WHERE 
        CASE WHEN v_user_id_column = 'user_id' THEN user_id ELSE id END = v_industri_user_id
    AND full_name IS NULL;

    -- ============================================================================
    -- 5. CREATE PUBLISHED COURSES (Visible to Talenta)
    -- ============================================================================
    -- Course 1: Full Stack Web Development
    INSERT INTO public.kursus (
        kursus_id, mitra_id, title, description, category,
        duration_hours, price, skkni_code, aqrf_level,
        delivery_mode, status, published_at, created_at
    ) VALUES (
        v_kursus_id_1, v_mitra_profile_id,
        'Full Stack Web Development',
        'Comprehensive course covering modern web development including React, Node.js, Express, PostgreSQL, and deployment. Learn to build complete web applications from scratch with best practices.',
        'Technology',
        120,
        2500000,
        'SKKNI-IT-2023-001',
        4,
        'HYBRID',
        'PUBLISHED',
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '35 days'
    ) ON CONFLICT (kursus_id) DO UPDATE SET
        status = 'PUBLISHED',
        published_at = COALESCE(kursus.published_at, NOW() - INTERVAL '30 days');

    -- Course 2: Cloud Computing Fundamentals
    INSERT INTO public.kursus (
        kursus_id, mitra_id, title, description, category,
        duration_hours, price, skkni_code, aqrf_level,
        delivery_mode, status, published_at, created_at
    ) VALUES (
        v_kursus_id_2, v_mitra_profile_id,
        'Cloud Computing Fundamentals',
        'Introduction to cloud computing concepts, AWS services, Azure basics, and deployment strategies. Perfect for beginners who want to understand cloud infrastructure.',
        'Cloud Computing',
        80,
        2000000,
        'SKKNI-IT-2023-002',
        3,
        'ONLINE',
        'PUBLISHED',
        NOW() - INTERVAL '25 days',
        NOW() - INTERVAL '30 days'
    ) ON CONFLICT (kursus_id) DO UPDATE SET
        status = 'PUBLISHED',
        published_at = COALESCE(kursus.published_at, NOW() - INTERVAL '25 days');

    -- Course 3: Mobile App Development
    INSERT INTO public.kursus (
        kursus_id, mitra_id, title, description, category,
        duration_hours, price, skkni_code, aqrf_level,
        delivery_mode, status, published_at, created_at
    ) VALUES (
        v_kursus_id_3, v_mitra_profile_id,
        'Mobile App Development with Flutter',
        'Build cross-platform mobile applications with Flutter. Learn Dart programming, state management, API integration, and app deployment to Google Play and App Store.',
        'Mobile Development',
        100,
        3000000,
        'SKKNI-IT-2023-003',
        4,
        'HYBRID',
        'PUBLISHED',
        NOW() - INTERVAL '20 days',
        NOW() - INTERVAL '25 days'
    ) ON CONFLICT (kursus_id) DO UPDATE SET
        status = 'PUBLISHED',
        published_at = COALESCE(kursus.published_at, NOW() - INTERVAL '20 days');

    -- Course 4: Data Science & Analytics
    INSERT INTO public.kursus (
        kursus_id, mitra_id, title, description, category,
        duration_hours, price, skkni_code, aqrf_level,
        delivery_mode, status, published_at, created_at
    ) VALUES (
        v_kursus_id_4, v_mitra_profile_id,
        'Data Science & Analytics with Python',
        'Learn Python for data analysis, machine learning basics, data visualization with Matplotlib and Seaborn, and statistical analysis. Includes real-world projects.',
        'Data Science',
        90,
        2800000,
        'SKKNI-IT-2023-004',
        5,
        'ONLINE',
        'PUBLISHED',
        NOW() - INTERVAL '15 days',
        NOW() - INTERVAL '20 days'
    ) ON CONFLICT (kursus_id) DO UPDATE SET
        status = 'PUBLISHED',
        published_at = COALESCE(kursus.published_at, NOW() - INTERVAL '15 days');

    -- Course 5: DevOps Engineering
    INSERT INTO public.kursus (
        kursus_id, mitra_id, title, description, category,
        duration_hours, price, skkni_code, aqrf_level,
        delivery_mode, status, published_at, created_at
    ) VALUES (
        v_kursus_id_5, v_mitra_profile_id,
        'DevOps Engineering',
        'Master CI/CD pipelines, containerization with Docker, Kubernetes orchestration, infrastructure as code with Terraform, and monitoring with Prometheus.',
        'DevOps',
        140,
        3500000,
        'SKKNI-IT-2023-005',
        5,
        'HYBRID',
        'PUBLISHED',
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '15 days'
    ) ON CONFLICT (kursus_id) DO UPDATE SET
        status = 'PUBLISHED',
        published_at = COALESCE(kursus.published_at, NOW() - INTERVAL '10 days');

    -- Course 6: UI/UX Design
    INSERT INTO public.kursus (
        kursus_id, mitra_id, title, description, category,
        duration_hours, price, skkni_code, aqrf_level,
        delivery_mode, status, published_at, created_at
    ) VALUES (
        v_kursus_id_6, v_mitra_profile_id,
        'UI/UX Design Mastery',
        'Learn design principles, user research, prototyping, and design tools like Figma and Adobe XD. Create beautiful and functional user interfaces.',
        'Design',
        80,
        2200000,
        'SKKNI-IT-2023-006',
        3,
        'OFFLINE',
        'PUBLISHED',
        NOW() - INTERVAL '8 days',
        NOW() - INTERVAL '12 days'
    ) ON CONFLICT (kursus_id) DO UPDATE SET
        status = 'PUBLISHED',
        published_at = COALESCE(kursus.published_at, NOW() - INTERVAL '8 days');

    -- Course 7: Cybersecurity Fundamentals
    INSERT INTO public.kursus (
        kursus_id, mitra_id, title, description, category,
        duration_hours, price, skkni_code, aqrf_level,
        delivery_mode, status, published_at, created_at
    ) VALUES (
        v_kursus_id_7, v_mitra_profile_id,
        'Cybersecurity Fundamentals',
        'Introduction to network security, ethical hacking, penetration testing, and security best practices. Learn to protect systems from cyber threats.',
        'Cybersecurity',
        90,
        2600000,
        'SKKNI-IT-2023-007',
        4,
        'HYBRID',
        'PUBLISHED',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '10 days'
    ) ON CONFLICT (kursus_id) DO UPDATE SET
        status = 'PUBLISHED',
        published_at = COALESCE(kursus.published_at, NOW() - INTERVAL '5 days');

    -- Course 8: Digital Marketing
    INSERT INTO public.kursus (
        kursus_id, mitra_id, title, description, category,
        duration_hours, price, skkni_code, aqrf_level,
        delivery_mode, status, published_at, created_at
    ) VALUES (
        v_kursus_id_8, v_mitra_profile_id,
        'Digital Marketing & Social Media',
        'Master SEO, social media marketing, content creation, Google Ads, Facebook Ads, and analytics. Build effective marketing campaigns.',
        'Marketing',
        60,
        1800000,
        'SKKNI-IT-2023-008',
        3,
        'ONLINE',
        'PUBLISHED',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '8 days'
    ) ON CONFLICT (kursus_id) DO UPDATE SET
        status = 'PUBLISHED',
        published_at = COALESCE(kursus.published_at, NOW() - INTERVAL '3 days');

    -- Course 9: Project Management
    INSERT INTO public.kursus (
        kursus_id, mitra_id, title, description, category,
        duration_hours, price, skkni_code, aqrf_level,
        delivery_mode, status, published_at, created_at
    ) VALUES (
        v_kursus_id_9, v_mitra_profile_id,
        'Agile Project Management',
        'Learn Agile, Scrum, project planning, team management, and project tracking tools. Become an effective project manager.',
        'Management',
        70,
        2000000,
        'SKKNI-IT-2023-009',
        3,
        'OFFLINE',
        'PUBLISHED',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '5 days'
    ) ON CONFLICT (kursus_id) DO UPDATE SET
        status = 'PUBLISHED',
        published_at = COALESCE(kursus.published_at, NOW() - INTERVAL '1 day');

    RAISE NOTICE 'Created/Updated 9 PUBLISHED courses';

    -- ============================================================================
    -- 6. CREATE MATERIALS FOR COURSES
    -- ============================================================================
    -- Materials for Course 1 (Full Stack Web Development)
    INSERT INTO public.materi (materi_id, kursus_id, title, material_type, file_url, order_index, created_at)
    VALUES
        (gen_random_uuid(), v_kursus_id_1, 'Introduction to Web Development', 'VIDEO', 'https://example.com/video/intro.mp4', 1, NOW()),
        (gen_random_uuid(), v_kursus_id_1, 'HTML & CSS Basics', 'VIDEO', 'https://example.com/video/html-css.mp4', 2, NOW()),
        (gen_random_uuid(), v_kursus_id_1, 'JavaScript Fundamentals', 'VIDEO', 'https://example.com/video/js-basics.mp4', 3, NOW()),
        (gen_random_uuid(), v_kursus_id_1, 'React Basics', 'VIDEO', 'https://example.com/video/react-intro.mp4', 4, NOW()),
        (gen_random_uuid(), v_kursus_id_1, 'Node.js & Express', 'VIDEO', 'https://example.com/video/nodejs.mp4', 5, NOW()),
        (gen_random_uuid(), v_kursus_id_1, 'Database Design', 'PDF', 'https://example.com/docs/database.pdf', 6, NOW()),
        (gen_random_uuid(), v_kursus_id_1, 'Final Project Quiz', 'QUIZ', NULL, 7, NOW())
    ON CONFLICT (materi_id) DO NOTHING;

    -- Materials for Course 2 (Cloud Computing)
    INSERT INTO public.materi (materi_id, kursus_id, title, material_type, file_url, order_index, created_at)
    VALUES
        (gen_random_uuid(), v_kursus_id_2, 'Introduction to Cloud Computing', 'VIDEO', 'https://example.com/video/cloud-intro.mp4', 1, NOW()),
        (gen_random_uuid(), v_kursus_id_2, 'AWS Services Overview', 'VIDEO', 'https://example.com/video/aws.mp4', 2, NOW()),
        (gen_random_uuid(), v_kursus_id_2, 'Azure Basics', 'VIDEO', 'https://example.com/video/azure.mp4', 3, NOW()),
        (gen_random_uuid(), v_kursus_id_2, 'Cloud Security', 'PDF', 'https://example.com/docs/cloud-security.pdf', 4, NOW()),
        (gen_random_uuid(), v_kursus_id_2, 'Cloud Computing Quiz', 'QUIZ', NULL, 5, NOW())
    ON CONFLICT (materi_id) DO NOTHING;

    -- Materials for Course 3 (Mobile App Development)
    INSERT INTO public.materi (materi_id, kursus_id, title, material_type, file_url, order_index, created_at)
    VALUES
        (gen_random_uuid(), v_kursus_id_3, 'Flutter Introduction', 'VIDEO', 'https://example.com/video/flutter-intro.mp4', 1, NOW()),
        (gen_random_uuid(), v_kursus_id_3, 'Dart Programming', 'VIDEO', 'https://example.com/video/dart.mp4', 2, NOW()),
        (gen_random_uuid(), v_kursus_id_3, 'State Management', 'VIDEO', 'https://example.com/video/state-management.mp4', 3, NOW()),
        (gen_random_uuid(), v_kursus_id_3, 'API Integration', 'VIDEO', 'https://example.com/video/api-integration.mp4', 4, NOW()),
        (gen_random_uuid(), v_kursus_id_3, 'App Deployment Guide', 'PDF', 'https://example.com/docs/deployment.pdf', 5, NOW()),
        (gen_random_uuid(), v_kursus_id_3, 'Mobile Development Quiz', 'QUIZ', NULL, 6, NOW())
    ON CONFLICT (materi_id) DO NOTHING;

    -- Materials for Course 4 (Data Science)
    INSERT INTO public.materi (materi_id, kursus_id, title, material_type, file_url, order_index, created_at)
    VALUES
        (gen_random_uuid(), v_kursus_id_4, 'Introduction to Data Science', 'VIDEO', 'https://example.com/video/datascience-intro.mp4', 1, NOW()),
        (gen_random_uuid(), v_kursus_id_4, 'Python Basics for Data Analysis', 'VIDEO', 'https://example.com/video/python-basics.mp4', 2, NOW()),
        (gen_random_uuid(), v_kursus_id_4, 'Pandas and NumPy', 'VIDEO', 'https://example.com/video/pandas-numpy.mp4', 3, NOW()),
        (gen_random_uuid(), v_kursus_id_4, 'Data Visualization', 'VIDEO', 'https://example.com/video/data-viz.mp4', 4, NOW()),
        (gen_random_uuid(), v_kursus_id_4, 'Machine Learning Basics', 'VIDEO', 'https://example.com/video/ml-basics.mp4', 5, NOW()),
        (gen_random_uuid(), v_kursus_id_4, 'Data Science Project Guide', 'PDF', 'https://example.com/docs/datascience-project.pdf', 6, NOW()),
        (gen_random_uuid(), v_kursus_id_4, 'Data Science Quiz', 'QUIZ', NULL, 7, NOW())
    ON CONFLICT (materi_id) DO NOTHING;

    -- Materials for Course 5 (DevOps)
    INSERT INTO public.materi (materi_id, kursus_id, title, material_type, file_url, order_index, created_at)
    VALUES
        (gen_random_uuid(), v_kursus_id_5, 'Introduction to DevOps', 'VIDEO', 'https://example.com/video/devops-intro.mp4', 1, NOW()),
        (gen_random_uuid(), v_kursus_id_5, 'Docker Fundamentals', 'VIDEO', 'https://example.com/video/docker.mp4', 2, NOW()),
        (gen_random_uuid(), v_kursus_id_5, 'Kubernetes Basics', 'VIDEO', 'https://example.com/video/kubernetes.mp4', 3, NOW()),
        (gen_random_uuid(), v_kursus_id_5, 'CI/CD Pipelines', 'VIDEO', 'https://example.com/video/cicd.mp4', 4, NOW()),
        (gen_random_uuid(), v_kursus_id_5, 'Infrastructure as Code', 'VIDEO', 'https://example.com/video/iac.mp4', 5, NOW()),
        (gen_random_uuid(), v_kursus_id_5, 'DevOps Best Practices', 'PDF', 'https://example.com/docs/devops-best-practices.pdf', 6, NOW()),
        (gen_random_uuid(), v_kursus_id_5, 'DevOps Quiz', 'QUIZ', NULL, 7, NOW())
    ON CONFLICT (materi_id) DO NOTHING;

    -- Materials for Course 6 (UI/UX Design)
    INSERT INTO public.materi (materi_id, kursus_id, title, material_type, file_url, order_index, created_at)
    VALUES
        (gen_random_uuid(), v_kursus_id_6, 'Design Principles', 'VIDEO', 'https://example.com/video/design-principles.mp4', 1, NOW()),
        (gen_random_uuid(), v_kursus_id_6, 'User Research Methods', 'VIDEO', 'https://example.com/video/user-research.mp4', 2, NOW()),
        (gen_random_uuid(), v_kursus_id_6, 'Figma Tutorial', 'VIDEO', 'https://example.com/video/figma-tutorial.mp4', 3, NOW()),
        (gen_random_uuid(), v_kursus_id_6, 'Prototyping', 'VIDEO', 'https://example.com/video/prototyping.mp4', 4, NOW()),
        (gen_random_uuid(), v_kursus_id_6, 'Design System Guide', 'PDF', 'https://example.com/docs/design-system.pdf', 5, NOW()),
        (gen_random_uuid(), v_kursus_id_6, 'UI/UX Design Quiz', 'QUIZ', NULL, 6, NOW())
    ON CONFLICT (materi_id) DO NOTHING;

    -- Materials for Course 7 (Cybersecurity)
    INSERT INTO public.materi (materi_id, kursus_id, title, material_type, file_url, order_index, created_at)
    VALUES
        (gen_random_uuid(), v_kursus_id_7, 'Introduction to Cybersecurity', 'VIDEO', 'https://example.com/video/cybersecurity-intro.mp4', 1, NOW()),
        (gen_random_uuid(), v_kursus_id_7, 'Network Security', 'VIDEO', 'https://example.com/video/network-security.mp4', 2, NOW()),
        (gen_random_uuid(), v_kursus_id_7, 'Ethical Hacking Basics', 'VIDEO', 'https://example.com/video/ethical-hacking.mp4', 3, NOW()),
        (gen_random_uuid(), v_kursus_id_7, 'Security Best Practices', 'PDF', 'https://example.com/docs/security-practices.pdf', 4, NOW()),
        (gen_random_uuid(), v_kursus_id_7, 'Cybersecurity Quiz', 'QUIZ', NULL, 5, NOW())
    ON CONFLICT (materi_id) DO NOTHING;

    -- Materials for Course 8 (Digital Marketing)
    INSERT INTO public.materi (materi_id, kursus_id, title, material_type, file_url, order_index, created_at)
    VALUES
        (gen_random_uuid(), v_kursus_id_8, 'Digital Marketing Overview', 'VIDEO', 'https://example.com/video/marketing-overview.mp4', 1, NOW()),
        (gen_random_uuid(), v_kursus_id_8, 'SEO Fundamentals', 'VIDEO', 'https://example.com/video/seo-fundamentals.mp4', 2, NOW()),
        (gen_random_uuid(), v_kursus_id_8, 'Social Media Marketing', 'VIDEO', 'https://example.com/video/social-media.mp4', 3, NOW()),
        (gen_random_uuid(), v_kursus_id_8, 'Google Ads & Facebook Ads', 'VIDEO', 'https://example.com/video/ads-platforms.mp4', 4, NOW()),
        (gen_random_uuid(), v_kursus_id_8, 'Marketing Analytics', 'VIDEO', 'https://example.com/video/marketing-analytics.mp4', 5, NOW()),
        (gen_random_uuid(), v_kursus_id_8, 'Digital Marketing Quiz', 'QUIZ', NULL, 6, NOW())
    ON CONFLICT (materi_id) DO NOTHING;

    -- Materials for Course 9 (Project Management)
    INSERT INTO public.materi (materi_id, kursus_id, title, material_type, file_url, order_index, created_at)
    VALUES
        (gen_random_uuid(), v_kursus_id_9, 'Introduction to Project Management', 'VIDEO', 'https://example.com/video/pm-intro.mp4', 1, NOW()),
        (gen_random_uuid(), v_kursus_id_9, 'Agile Methodology', 'VIDEO', 'https://example.com/video/agile.mp4', 2, NOW()),
        (gen_random_uuid(), v_kursus_id_9, 'Scrum Framework', 'VIDEO', 'https://example.com/video/scrum.mp4', 3, NOW()),
        (gen_random_uuid(), v_kursus_id_9, 'Project Planning & Tracking', 'VIDEO', 'https://example.com/video/project-planning.mp4', 4, NOW()),
        (gen_random_uuid(), v_kursus_id_9, 'Team Management', 'PDF', 'https://example.com/docs/team-management.pdf', 5, NOW()),
        (gen_random_uuid(), v_kursus_id_9, 'Project Management Quiz', 'QUIZ', NULL, 6, NOW())
    ON CONFLICT (materi_id) DO NOTHING;

    RAISE NOTICE 'Created materials for all courses';

    -- ============================================================================
    -- 7. CREATE ENROLLMENTS (Talenta enrolled in courses)
    -- ============================================================================
    INSERT INTO public.enrollments (talenta_id, kursus_id, status, enrolled_at, progress)
    VALUES
        (v_talenta_profile_id, v_kursus_id_1, 'ENROLLED', NOW() - INTERVAL '20 days', 45),
        (v_talenta_profile_id, v_kursus_id_2, 'ENROLLED', NOW() - INTERVAL '15 days', 30),
        (v_talenta_profile_id, v_kursus_id_3, 'ENROLLED', NOW() - INTERVAL '10 days', 10),
        (v_talenta_profile_id, v_kursus_id_4, 'ENROLLED', NOW() - INTERVAL '8 days', 25),
        (v_talenta_profile_id, v_kursus_id_5, 'ENROLLED', NOW() - INTERVAL '5 days', 15),
        (v_talenta_profile_id, v_kursus_id_6, 'ENROLLED', NOW() - INTERVAL '3 days', 5),
        (v_talenta_profile_id, v_kursus_id_7, 'ENROLLED', NOW() - INTERVAL '2 days', 0)
    ON CONFLICT (talenta_id, kursus_id) DO UPDATE SET
        status = 'ENROLLED',
        progress = GREATEST(enrollments.progress, EXCLUDED.progress);

    RAISE NOTICE 'Created enrollments';

    -- ============================================================================
    -- 8. CREATE WORKSHOPS
    -- ============================================================================
    INSERT INTO public.workshops (
        workshop_id, mitra_id, title, description, location_name, city, province,
        start_date, end_date, capacity, price, status, created_at
    )
    VALUES
        (
            gen_random_uuid(),
            v_mitra_profile_id,
            'Web Development Bootcamp',
            'Intensive 3-day bootcamp covering modern web development technologies.',
            'Jakarta Convention Center',
            'Jakarta',
            'DKI Jakarta',
            NOW() + INTERVAL '7 days',
            NOW() + INTERVAL '9 days',
            30,
            500000,
            'PUBLISHED',
            NOW() - INTERVAL '5 days'
        ),
        (
            gen_random_uuid(),
            v_mitra_profile_id,
            'Cloud Computing Workshop',
            'Hands-on workshop on AWS and Azure cloud services.',
            'Bandung Tech Hub',
            'Bandung',
            'Jawa Barat',
            NOW() + INTERVAL '14 days',
            NOW() + INTERVAL '15 days',
            25,
            400000,
            'PUBLISHED',
            NOW() - INTERVAL '3 days'
        ),
        (
            gen_random_uuid(),
            v_mitra_profile_id,
            'Mobile App Development Seminar',
            'Learn Flutter and React Native in this comprehensive seminar.',
            'Surabaya Innovation Center',
            'Surabaya',
            'Jawa Timur',
            NOW() + INTERVAL '21 days',
            NOW() + INTERVAL '22 days',
            40,
            600000,
            'PUBLISHED',
            NOW() - INTERVAL '1 day'
        )
    ON CONFLICT (workshop_id) DO NOTHING;

    RAISE NOTICE 'Created workshops';

    -- ============================================================================
    -- 9. CREATE WORKSHOP REGISTRATIONS
    -- ============================================================================
    INSERT INTO public.workshop_registrations (workshop_id, talenta_id, registered_at, status)
    SELECT
        w.workshop_id,
        v_talenta_profile_id,
        NOW() - INTERVAL '2 days',
        'CONFIRMED'
    FROM public.workshops w
    WHERE w.mitra_id = v_mitra_profile_id
    LIMIT 2
    ON CONFLICT (workshop_id, talenta_id) DO NOTHING;

    RAISE NOTICE 'Created workshop registrations';

    -- ============================================================================
    -- 10. CREATE JOB POSTINGS (by Industri)
    -- ============================================================================
    -- Note: job_postings table uses 'id' as primary key and 'industri_id' references users(id) or industri_profiles(profile_id)
    -- Check if industri_id should reference industri_profiles or users
    INSERT INTO public.job_postings (
        id, industri_id, title, description, location, city, province,
        salary_min, salary_max, status, created_at
    )
    VALUES
        (
            gen_random_uuid(),
            v_industri_profile_id, -- This should be the profile_id from industri_profiles
            'Senior Full Stack Developer',
            'We are looking for an experienced Full Stack Developer to join our team. Must have experience with React, Node.js, and PostgreSQL.',
            'Jl. Sudirman No. 123',
            'Jakarta',
            'DKI Jakarta',
            15000000,
            25000000,
            'PUBLISHED',
            NOW() - INTERVAL '15 days'
        ),
        (
            gen_random_uuid(),
            v_industri_profile_id,
            'DevOps Engineer',
            'Seeking a DevOps Engineer with experience in AWS, Docker, and Kubernetes. CI/CD pipeline experience required.',
            'Jl. Sudirman No. 123',
            'Jakarta',
            'DKI Jakarta',
            12000000,
            20000000,
            'PUBLISHED',
            NOW() - INTERVAL '10 days'
        )
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Created job postings';

    -- ============================================================================
    -- SUMMARY
    -- ============================================================================
    RAISE NOTICE '';
    RAISE NOTICE '✅ Comprehensive seed data created successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Summary:';
    RAISE NOTICE '  - Courses (PUBLISHED): %', (SELECT COUNT(*) FROM public.kursus WHERE status = 'PUBLISHED');
    RAISE NOTICE '  - Materials: %', (SELECT COUNT(*) FROM public.materi);
    RAISE NOTICE '  - Enrollments: %', (SELECT COUNT(*) FROM public.enrollments);
    RAISE NOTICE '  - Workshops: %', (SELECT COUNT(*) FROM public.workshops);
    RAISE NOTICE '  - Workshop Registrations: %', (SELECT COUNT(*) FROM public.workshop_registrations);
    RAISE NOTICE '  - Job Postings: %', (SELECT COUNT(*) FROM public.job_postings WHERE status = 'PUBLISHED');
    RAISE NOTICE '';
    RAISE NOTICE '🔑 Demo Accounts (password: password123):';
    RAISE NOTICE '  Talenta: talenta1@demo.com';
    RAISE NOTICE '  Mitra: mitra1@demo.com';
    RAISE NOTICE '  Industri: industri1@demo.com';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Course Visibility Rules:';
    RAISE NOTICE '  - Talenta can only see courses with status = PUBLISHED';
    RAISE NOTICE '  - Mitra can see all their courses (DRAFT, PUBLISHED, etc.)';
    RAISE NOTICE '  - All courses in this seed are PUBLISHED and visible to Talenta';
END $$;
