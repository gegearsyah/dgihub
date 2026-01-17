-- Additional Seed Data with Variety
-- This file adds more diverse data for testing various features
-- Run after seed_learning_data.sql

-- ============================================================================
-- ADDITIONAL WORKSHOPS WITH VARIETY
-- ============================================================================

DO $$
DECLARE
    v_mitra_user_id UUID;
    v_mitra_profile_id UUID;
    v_talenta_user_id UUID;
    v_talenta_profile_id UUID;
    v_user_id_column TEXT;
    v_workshop_id_1 UUID := '660e8400-e29b-41d4-a716-446655440001'::UUID;
    v_workshop_id_2 UUID := '660e8400-e29b-41d4-a716-446655440002'::UUID;
    v_workshop_id_3 UUID := '660e8400-e29b-41d4-a716-446655440003'::UUID;
    v_workshop_id_4 UUID := '660e8400-e29b-41d4-a716-446655440004'::UUID;
BEGIN
    -- Detect user_id column
    SELECT column_name INTO v_user_id_column
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name IN ('user_id', 'id')
    ORDER BY CASE WHEN column_name = 'user_id' THEN 1 ELSE 2 END
    LIMIT 1;
    
    -- Get MITRA user
    IF v_user_id_column = 'user_id' THEN
        SELECT user_id INTO v_mitra_user_id FROM public.users WHERE user_type = 'MITRA' LIMIT 1;
    ELSE
        SELECT id INTO v_mitra_user_id FROM public.users WHERE user_type = 'MITRA' LIMIT 1;
    END IF;
    
    -- Get MITRA profile
    IF v_user_id_column = 'user_id' THEN
        SELECT profile_id INTO v_mitra_profile_id 
        FROM public.mitra_profiles 
        WHERE user_id = v_mitra_user_id 
        LIMIT 1;
    ELSE
        SELECT profile_id INTO v_mitra_profile_id 
        FROM public.mitra_profiles 
        WHERE user_id = v_mitra_user_id 
        LIMIT 1;
    END IF;
    
    IF v_mitra_profile_id IS NULL THEN
        RAISE NOTICE 'No MITRA profile found. Skipping workshop creation.';
        RETURN;
    END IF;

    -- Workshop 1: Free Web Development Workshop (PUBLISHED)
    INSERT INTO public.workshops (
        workshop_id,
        mitra_id,
        title,
        description,
        start_date,
        end_date,
        start_time,
        end_time,
        location_name,
        city,
        province,
        address,
        capacity,
        price,
        status,
        created_at
    ) VALUES (
        v_workshop_id_1,
        v_mitra_profile_id,
        'Web Development Fundamentals Workshop',
        'Learn HTML, CSS, and JavaScript basics. Perfect for beginners who want to start their web development journey. Hands-on practice included.',
        CURRENT_DATE + INTERVAL '10 days',
        CURRENT_DATE + INTERVAL '10 days',
        '09:00:00',
        '17:00:00',
        'Tech Hub Jakarta',
        'Jakarta',
        'DKI Jakarta',
        'Jl. Sudirman No. 123, Jakarta Pusat',
        50,
        0,
        'PUBLISHED',
        NOW() - INTERVAL '5 days'
    ) ON CONFLICT (workshop_id) DO NOTHING;

    -- Workshop 2: Paid Data Science Workshop (PUBLISHED)
    INSERT INTO public.workshops (
        workshop_id,
        mitra_id,
        title,
        description,
        start_date,
        end_date,
        start_time,
        end_time,
        location_name,
        city,
        province,
        address,
        capacity,
        price,
        status,
        created_at
    ) VALUES (
        v_workshop_id_2,
        v_mitra_profile_id,
        'Data Science with Python Workshop',
        'Comprehensive data science workshop covering Python, pandas, numpy, and machine learning basics. Includes real-world projects.',
        CURRENT_DATE + INTERVAL '15 days',
        CURRENT_DATE + INTERVAL '16 days',
        '08:00:00',
        '16:00:00',
        'Data Science Academy',
        'Bandung',
        'Jawa Barat',
        'Jl. Dago No. 456, Bandung',
        30,
        500000,
        'PUBLISHED',
        NOW() - INTERVAL '3 days'
    ) ON CONFLICT (workshop_id) DO NOTHING;

    -- Workshop 3: Free Digital Marketing Workshop (DRAFT)
    INSERT INTO public.workshops (
        workshop_id,
        mitra_id,
        title,
        description,
        start_date,
        end_date,
        start_time,
        end_time,
        location_name,
        city,
        province,
        address,
        capacity,
        price,
        status,
        created_at
    ) VALUES (
        v_workshop_id_3,
        v_mitra_profile_id,
        'Digital Marketing Masterclass',
        'Learn social media marketing, SEO, content marketing, and email campaigns. Perfect for entrepreneurs and marketers.',
        CURRENT_DATE + INTERVAL '20 days',
        CURRENT_DATE + INTERVAL '20 days',
        '10:00:00',
        '15:00:00',
        'Marketing Hub',
        'Surabaya',
        'Jawa Timur',
        'Jl. Pemuda No. 789, Surabaya',
        40,
        0,
        'DRAFT',
        NOW() - INTERVAL '1 day'
    ) ON CONFLICT (workshop_id) DO NOTHING;

    -- Workshop 4: Paid UI/UX Design Workshop (PUBLISHED)
    INSERT INTO public.workshops (
        workshop_id,
        mitra_id,
        title,
        description,
        start_date,
        end_date,
        start_time,
        end_time,
        location_name,
        city,
        province,
        address,
        capacity,
        price,
        status,
        created_at
    ) VALUES (
        v_workshop_id_4,
        v_mitra_profile_id,
        'UI/UX Design Bootcamp',
        'Master the art of user interface and user experience design. Learn design principles, tools, and create a portfolio project.',
        CURRENT_DATE + INTERVAL '25 days',
        CURRENT_DATE + INTERVAL '27 days',
        '09:00:00',
        '17:00:00',
        'Design Studio',
        'Yogyakarta',
        'DI Yogyakarta',
        'Jl. Malioboro No. 321, Yogyakarta',
        25,
        750000,
        'PUBLISHED',
        NOW() - INTERVAL '2 days'
    ) ON CONFLICT (workshop_id) DO NOTHING;

    RAISE NOTICE 'Created additional workshops';

    -- ============================================================================
    -- ADDITIONAL COURSES WITH VARIETY
    -- ============================================================================

    -- Course 1: Advanced React Development
    INSERT INTO public.kursus (
        kursus_id,
        mitra_id,
        title,
        description,
        category,
        duration_hours,
        skkni_code,
        status,
        created_at
    ) VALUES (
        '770e8400-e29b-41d4-a716-446655440001'::UUID,
        v_mitra_profile_id,
        'Advanced React Development',
        'Master React hooks, context API, performance optimization, and advanced patterns. Build complex applications with best practices.',
        'Programming',
        40,
        'SK-KNI-2024-001',
        'PUBLISHED',
        NOW() - INTERVAL '7 days'
    ) ON CONFLICT (kursus_id) DO NOTHING;

    -- Course 2: Cloud Computing Fundamentals
    INSERT INTO public.kursus (
        kursus_id,
        mitra_id,
        title,
        description,
        category,
        duration_hours,
        skkni_code,
        status,
        created_at
    ) VALUES (
        '770e8400-e29b-41d4-a716-446655440002'::UUID,
        v_mitra_profile_id,
        'Cloud Computing Fundamentals',
        'Learn AWS, Azure, and GCP basics. Understand cloud architecture, deployment, and management. Hands-on labs included.',
        'Cloud Computing',
        30,
        'SK-KNI-2024-002',
        'PUBLISHED',
        NOW() - INTERVAL '5 days'
    ) ON CONFLICT (kursus_id) DO NOTHING;

    -- Course 3: Mobile App Development
    INSERT INTO public.kursus (
        kursus_id,
        mitra_id,
        title,
        description,
        category,
        duration_hours,
        skkni_code,
        status,
        created_at
    ) VALUES (
        '770e8400-e29b-41d4-a716-446655440003'::UUID,
        v_mitra_profile_id,
        'Mobile App Development with Flutter',
        'Build cross-platform mobile applications with Flutter. Learn Dart programming, state management, and app deployment.',
        'Mobile Development',
        50,
        'SK-KNI-2024-003',
        'PUBLISHED',
        NOW() - INTERVAL '3 days'
    ) ON CONFLICT (kursus_id) DO NOTHING;

    RAISE NOTICE 'Created additional courses';

    -- ============================================================================
    -- ADDITIONAL WORKSHOP REGISTRATIONS
    -- ============================================================================

    -- Get TALENTA user for registrations
    IF v_user_id_column = 'user_id' THEN
        SELECT user_id INTO v_talenta_user_id FROM public.users WHERE user_type = 'TALENTA' LIMIT 1;
    ELSE
        SELECT id INTO v_talenta_user_id FROM public.users WHERE user_type = 'TALENTA' LIMIT 1;
    END IF;

    IF v_talenta_user_id IS NOT NULL THEN
        IF v_user_id_column = 'user_id' THEN
            SELECT profile_id INTO v_talenta_profile_id 
            FROM public.talenta_profiles 
            WHERE user_id = v_talenta_user_id 
            LIMIT 1;
        ELSE
            SELECT profile_id INTO v_talenta_profile_id 
            FROM public.talenta_profiles 
            WHERE user_id = v_talenta_user_id 
            LIMIT 1;
        END IF;

        IF v_talenta_profile_id IS NOT NULL THEN
            -- Register for Workshop 1
            INSERT INTO public.workshop_registrations (
                workshop_id,
                talenta_id,
                registered_at,
                status
            ) VALUES (
                v_workshop_id_1,
                v_talenta_profile_id,
                NOW() - INTERVAL '2 days',
                'CONFIRMED'
            ) ON CONFLICT (workshop_id, talenta_id) DO NOTHING;

            -- Register for Workshop 2
            INSERT INTO public.workshop_registrations (
                workshop_id,
                talenta_id,
                registered_at,
                status
            ) VALUES (
                v_workshop_id_2,
                v_talenta_profile_id,
                NOW() - INTERVAL '1 day',
                'CONFIRMED'
            ) ON CONFLICT (workshop_id, talenta_id) DO NOTHING;

            RAISE NOTICE 'Created workshop registrations';
        END IF;
    END IF;

END $$;

-- ============================================================================
-- ADDITIONAL MATERIALS FOR NEW COURSES
-- ============================================================================

DO $$
DECLARE
    v_react_course_id UUID := '770e8400-e29b-41d4-a716-446655440001'::UUID;
    v_cloud_course_id UUID := '770e8400-e29b-41d4-a716-446655440002'::UUID;
    v_flutter_course_id UUID := '770e8400-e29b-41d4-a716-446655440003'::UUID;
BEGIN
    -- React Course Materials
    INSERT INTO public.materi (
        materi_id,
        kursus_id,
        title,
        description,
        material_type,
        file_url,
        order_index,
        duration_seconds
    ) VALUES
    (
        '880e8400-e29b-41d4-a716-446655440001'::UUID,
        v_react_course_id,
        'Introduction to React Hooks',
        'Learn about useState, useEffect, and custom hooks',
        'VIDEO',
        'https://example.com/videos/react-hooks-intro.mp4',
        1,
        1800
    ),
    (
        '880e8400-e29b-41d4-a716-446655440002'::UUID,
        v_react_course_id,
        'Context API Deep Dive',
        'Understanding Context API and when to use it',
        'VIDEO',
        'https://example.com/videos/react-context.mp4',
        2,
        2400
    ),
    (
        '880e8400-e29b-41d4-a716-446655440003'::UUID,
        v_react_course_id,
        'React Performance Optimization',
        'Techniques to optimize React application performance',
        'PDF',
        'https://example.com/docs/react-performance.pdf',
        3,
        NULL
    ) ON CONFLICT (materi_id) DO NOTHING;

    -- Cloud Course Materials
    INSERT INTO public.materi (
        materi_id,
        kursus_id,
        title,
        description,
        material_type,
        file_url,
        order_index,
        duration_seconds
    ) VALUES
    (
        '880e8400-e29b-41d4-a716-446655440004'::UUID,
        v_cloud_course_id,
        'AWS Fundamentals',
        'Introduction to Amazon Web Services',
        'VIDEO',
        'https://example.com/videos/aws-fundamentals.mp4',
        1,
        3600
    ),
    (
        '880e8400-e29b-41d4-a716-446655440005'::UUID,
        v_cloud_course_id,
        'Azure Basics',
        'Getting started with Microsoft Azure',
        'VIDEO',
        'https://example.com/videos/azure-basics.mp4',
        2,
        3600
    ) ON CONFLICT (materi_id) DO NOTHING;

    -- Flutter Course Materials
    INSERT INTO public.materi (
        materi_id,
        kursus_id,
        title,
        description,
        material_type,
        file_url,
        order_index,
        duration_seconds
    ) VALUES
    (
        '880e8400-e29b-41d4-a716-446655440006'::UUID,
        v_flutter_course_id,
        'Dart Programming Basics',
        'Learn Dart programming language fundamentals',
        'VIDEO',
        'https://example.com/videos/dart-basics.mp4',
        1,
        2700
    ),
    (
        '880e8400-e29b-41d4-a716-446655440007'::UUID,
        v_flutter_course_id,
        'Flutter Widgets',
        'Understanding Flutter widgets and layouts',
        'VIDEO',
        'https://example.com/videos/flutter-widgets.mp4',
        2,
        3000
    ) ON CONFLICT (materi_id) DO NOTHING;

    RAISE NOTICE 'Created additional course materials';
END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT 'Additional Workshops' as table_name, COUNT(*) as count FROM public.workshops
WHERE workshop_id IN (
    '660e8400-e29b-41d4-a716-446655440001'::UUID,
    '660e8400-e29b-41d4-a716-446655440002'::UUID,
    '660e8400-e29b-41d4-a716-446655440003'::UUID,
    '660e8400-e29b-41d4-a716-446655440004'::UUID
)
UNION ALL
SELECT 'Additional Courses', COUNT(*) FROM public.kursus
WHERE kursus_id IN (
    '770e8400-e29b-41d4-a716-446655440001'::UUID,
    '770e8400-e29b-41d4-a716-446655440002'::UUID,
    '770e8400-e29b-41d4-a716-446655440003'::UUID
)
UNION ALL
SELECT 'Additional Materials', COUNT(*) FROM public.materi
WHERE materi_id IN (
    '880e8400-e29b-41d4-a716-446655440001'::UUID,
    '880e8400-e29b-41d4-a716-446655440002'::UUID,
    '880e8400-e29b-41d4-a716-446655440003'::UUID,
    '880e8400-e29b-41d4-a716-446655440004'::UUID,
    '880e8400-e29b-41d4-a716-446655440005'::UUID,
    '880e8400-e29b-41d4-a716-446655440006'::UUID,
    '880e8400-e29b-41d4-a716-446655440007'::UUID
);
