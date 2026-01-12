-- Seed Data for Learning Experience Feature (FIXED VERSION)
-- IMPORTANT: Run migrations 005 and 006 FIRST before running this seed data
-- This file contains sample data for testing the learning experience, quizzes, and workshop attendance

-- ============================================================================
-- PREREQUISITES CHECK
-- ============================================================================
-- Make sure you have:
-- 1. At least one MITRA user in the users table
-- 2. At least one TALENTA user in the users table
-- 3. Run migrations 005_add_learning_tables.sql and 006_fix_enrollments_foreign_keys.sql first

-- ============================================================================
-- 1. CREATE MITRA PROFILE (if doesn't exist)
-- ============================================================================

DO $$
DECLARE
    v_mitra_user_id UUID;
    v_mitra_profile_id UUID;
    v_user_id_column TEXT;
BEGIN
    -- Detect which column name exists (user_id or id)
    SELECT column_name INTO v_user_id_column
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name IN ('user_id', 'id')
    ORDER BY CASE WHEN column_name = 'user_id' THEN 1 ELSE 2 END
    LIMIT 1;
    
    -- Get first MITRA user using the correct column name
    IF v_user_id_column = 'user_id' THEN
        SELECT user_id INTO v_mitra_user_id 
        FROM public.users 
        WHERE user_type = 'MITRA' 
        LIMIT 1;
    ELSIF v_user_id_column = 'id' THEN
        SELECT id INTO v_mitra_user_id 
        FROM public.users 
        WHERE user_type = 'MITRA' 
        LIMIT 1;
    END IF;
    
    -- If no MITRA user exists, show message
    IF v_mitra_user_id IS NULL THEN
        RAISE NOTICE 'No MITRA user found. Please create a MITRA user first.';
        RETURN;
    END IF;
    
    -- Get or create mitra profile
    SELECT profile_id INTO v_mitra_profile_id
    FROM public.mitra_profiles
    WHERE user_id = v_mitra_user_id
    LIMIT 1;
    
    IF v_mitra_profile_id IS NULL THEN
        INSERT INTO public.mitra_profiles (user_id, organization_name)
        VALUES (v_mitra_user_id, 'Sample Training Provider')
        RETURNING profile_id INTO v_mitra_profile_id;
        
        RAISE NOTICE 'Created mitra profile: %', v_mitra_profile_id;
    ELSE
        RAISE NOTICE 'Using existing mitra profile: %', v_mitra_profile_id;
    END IF;
END $$;

-- ============================================================================
-- 2. COURSES WITH MATERIALS
-- ============================================================================

-- Insert a sample course
INSERT INTO public.kursus (
  kursus_id,
  mitra_id,
  title,
  description,
  category,
  skkni_code,
  aqrf_level,
  duration_hours,
  price,
  status,
  created_at
) 
SELECT 
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  (SELECT profile_id FROM public.mitra_profiles LIMIT 1),
  'Full Stack Web Development',
  'Comprehensive course covering modern web development including React, Node.js, and database management. Learn to build complete web applications from scratch.',
  'Technology',
  'SKKNI-IT-2023-001',
  4,
  120,
  2500000,
  'PUBLISHED',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.kursus 
  WHERE kursus_id = '550e8400-e29b-41d4-a716-446655440001'::UUID
);

-- Insert course materials (videos, documents, quizzes)
INSERT INTO public.materi (
  materi_id,
  kursus_id,
  title,
  description,
  material_type,
  file_url,
  file_type,
  order_index,
  duration_seconds,
  requires_completion,
  status,
  created_at
) VALUES
-- Video Material 1
(
  '660e8400-e29b-41d4-a716-446655440001'::UUID,
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'Introduction to Web Development',
  'Learn the fundamentals of web development and modern development practices.',
  'VIDEO',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'video/mp4',
  1,
  3600,
  true,
  'ACTIVE',
  NOW()
),
-- Video Material 2
(
  '660e8400-e29b-41d4-a716-446655440002'::UUID,
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'React Fundamentals',
  'Deep dive into React components, hooks, and state management.',
  'VIDEO',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'video/mp4',
  2,
  5400,
  true,
  'ACTIVE',
  NOW()
),
-- PDF Document
(
  '660e8400-e29b-41d4-a716-446655440003'::UUID,
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'JavaScript Best Practices Guide',
  'Comprehensive guide to writing clean and maintainable JavaScript code.',
  'PDF',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  'application/pdf',
  3,
  NULL,
  true,
  'ACTIVE',
  NOW()
),
-- Quiz Material
(
  '660e8400-e29b-41d4-a716-446655440004'::UUID,
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'React Fundamentals Quiz',
  'Test your understanding of React concepts with this comprehensive quiz.',
  'QUIZ',
  NULL,
  NULL,
  4,
  NULL,
  true,
  'ACTIVE',
  NOW()
),
-- Video Material 3
(
  '660e8400-e29b-41d4-a716-446655440005'::UUID,
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'Node.js Backend Development',
  'Learn to build robust backend APIs using Node.js and Express.',
  'VIDEO',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'video/mp4',
  5,
  7200,
  true,
  'ACTIVE',
  NOW()
),
-- External Link
(
  '660e8400-e29b-41d4-a716-446655440006'::UUID,
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'Additional Resources',
  'External resources and documentation for further learning.',
  'LINK',
  'https://react.dev',
  'text/html',
  6,
  NULL,
  false,
  'ACTIVE',
  NOW()
)
ON CONFLICT (materi_id) DO NOTHING;

-- Update quiz material with quiz data in description (JSON format)
UPDATE public.materi
SET description = '{
  "questions": [
    {
      "id": "q1",
      "question": "What is React?",
      "options": [
        "A JavaScript library for building user interfaces",
        "A database management system",
        "A server-side framework",
        "A programming language"
      ],
      "correctAnswer": "A JavaScript library for building user interfaces",
      "points": 1
    },
    {
      "id": "q2",
      "question": "What is a React Hook?",
      "options": [
        "A function that lets you use state and lifecycle features",
        "A component type",
        "A routing mechanism",
        "A styling library"
      ],
      "correctAnswer": "A function that lets you use state and lifecycle features",
      "points": 1
    },
    {
      "id": "q3",
      "question": "Which hook is used for managing state in functional components?",
      "options": [
        "useState",
        "useEffect",
        "useContext",
        "useReducer"
      ],
      "correctAnswer": "useState",
      "points": 1
    },
    {
      "id": "q4",
      "question": "What does JSX stand for?",
      "options": [
        "JavaScript XML",
        "Java Syntax Extension",
        "JSON XML",
        "JavaScript Extension"
      ],
      "correctAnswer": "JavaScript XML",
      "points": 1
    },
    {
      "id": "q5",
      "question": "How do you pass data to a child component in React?",
      "options": [
        "Using props",
        "Using state",
        "Using context",
        "Using refs"
      ],
      "correctAnswer": "Using props",
      "points": 1
    }
  ],
  "timeLimit": 15,
  "passingScore": 70
}'
WHERE materi_id = '660e8400-e29b-41d4-a716-446655440004'::UUID;

-- ============================================================================
-- 3. ENROLLMENTS (for testing)
-- ============================================================================

DO $$
DECLARE
    v_talenta_user_id UUID;
    v_talenta_profile_id UUID;
    v_user_id_column TEXT;
BEGIN
    -- Detect which column name exists (user_id or id)
    SELECT column_name INTO v_user_id_column
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name IN ('user_id', 'id')
    ORDER BY CASE WHEN column_name = 'user_id' THEN 1 ELSE 2 END
    LIMIT 1;
    
    -- Get first TALENTA user using the correct column name
    IF v_user_id_column = 'user_id' THEN
        SELECT user_id INTO v_talenta_user_id 
        FROM public.users 
        WHERE user_type = 'TALENTA' 
        LIMIT 1;
    ELSIF v_user_id_column = 'id' THEN
        SELECT id INTO v_talenta_user_id 
        FROM public.users 
        WHERE user_type = 'TALENTA' 
        LIMIT 1;
    END IF;
    
    IF v_talenta_user_id IS NULL THEN
        RAISE NOTICE 'No TALENTA user found. Please create a TALENTA user first.';
        RETURN;
    END IF;
    
    -- Get or create talenta profile
    SELECT profile_id INTO v_talenta_profile_id
    FROM public.talenta_profiles
    WHERE user_id = v_talenta_user_id
    LIMIT 1;
    
    IF v_talenta_profile_id IS NULL THEN
        INSERT INTO public.talenta_profiles (user_id)
        VALUES (v_talenta_user_id)
        RETURNING profile_id INTO v_talenta_profile_id;
        
        RAISE NOTICE 'Created talenta profile: %', v_talenta_profile_id;
    ELSE
        RAISE NOTICE 'Using existing talenta profile: %', v_talenta_profile_id;
    END IF;
    
    -- Create enrollment
    INSERT INTO public.enrollments (
      enrollment_id,
      talenta_id,
      kursus_id,
      enrolled_at,
      status,
      progress,
      created_at
    ) VALUES (
      '770e8400-e29b-41d4-a716-446655440001'::UUID,
      v_talenta_profile_id,
      '550e8400-e29b-41d4-a716-446655440001'::UUID,
      NOW() - INTERVAL '5 days',
      'ACTIVE',
      20,
      NOW()
    )
    ON CONFLICT (enrollment_id) DO NOTHING;
    
    -- Also update course_id for compatibility (if column exists)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'enrollments' 
        AND column_name = 'course_id'
    ) THEN
        UPDATE public.enrollments
        SET course_id = kursus_id
        WHERE enrollment_id = '770e8400-e29b-41d4-a716-446655440001'::UUID
        AND course_id IS NULL;
    END IF;
    
    RAISE NOTICE 'Created enrollment for course: 550e8400-e29b-41d4-a716-446655440001';
END $$;

-- ============================================================================
-- 4. MATERIAL COMPLETIONS (sample progress)
-- ============================================================================

DO $$
DECLARE
    v_talenta_profile_id UUID;
BEGIN
    SELECT profile_id INTO v_talenta_profile_id
    FROM public.talenta_profiles
    LIMIT 1;
    
    IF v_talenta_profile_id IS NOT NULL THEN
        INSERT INTO public.material_completions (
          materi_id,
          talenta_id,
          completed_at,
          created_at
        ) VALUES (
          '660e8400-e29b-41d4-a716-446655440001'::UUID,
          v_talenta_profile_id,
          NOW() - INTERVAL '3 days',
          NOW()
        )
        ON CONFLICT (materi_id, talenta_id) DO NOTHING;
        
        RAISE NOTICE 'Marked first material as completed';
    END IF;
END $$;

-- ============================================================================
-- 5. WORKSHOPS WITH LOCATION DATA
-- ============================================================================

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
  address,
  city,
  province,
  latitude,
  longitude,
  capacity,
  status,
  created_at
) 
SELECT 
  '880e8400-e29b-41d4-a716-446655440001'::UUID,
  (SELECT profile_id FROM public.mitra_profiles LIMIT 1),
  'Hands-on React Workshop',
  'Interactive workshop on building React applications with real-world examples.',
  CURRENT_DATE + INTERVAL '7 days',
  CURRENT_DATE + INTERVAL '7 days',
  '09:00:00'::TIME,
  '17:00:00'::TIME,
  'Training Center Jakarta',
  'Jl. Sudirman No. 123',
  'Jakarta Pusat',
  'DKI Jakarta',
  -6.2088,
  106.8456,
  30,
  'PUBLISHED',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.workshops 
  WHERE workshop_id = '880e8400-e29b-41d4-a716-446655440001'::UUID
);

-- ============================================================================
-- 6. WORKSHOP REGISTRATIONS
-- ============================================================================

DO $$
DECLARE
    v_talenta_profile_id UUID;
BEGIN
    SELECT profile_id INTO v_talenta_profile_id
    FROM public.talenta_profiles
    LIMIT 1;
    
    IF v_talenta_profile_id IS NOT NULL THEN
        INSERT INTO public.workshop_registrations (
          registration_id,
          workshop_id,
          talenta_id,
          registered_at,
          status,
          created_at
        ) VALUES (
          '990e8400-e29b-41d4-a716-446655440001'::UUID,
          '880e8400-e29b-41d4-a716-446655440001'::UUID,
          v_talenta_profile_id,
          NOW() - INTERVAL '2 days',
          'CONFIRMED',
          NOW()
        )
        ON CONFLICT (registration_id) DO NOTHING;
        
        RAISE NOTICE 'Registered talenta for workshop';
    END IF;
END $$;

-- ============================================================================
-- 7. ADDITIONAL COURSE (for more testing)
-- ============================================================================

INSERT INTO public.kursus (
  kursus_id,
  mitra_id,
  title,
  description,
  category,
  skkni_code,
  aqrf_level,
  duration_hours,
  price,
  status,
  created_at
) 
SELECT 
  '550e8400-e29b-41d4-a716-446655440002'::UUID,
  (SELECT profile_id FROM public.mitra_profiles LIMIT 1),
  'Digital Marketing Fundamentals',
  'Learn digital marketing strategies including SEO, social media marketing, and content creation.',
  'Business',
  'SKKNI-MK-2023-002',
  3,
  80,
  1500000,
  'PUBLISHED',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.kursus 
  WHERE kursus_id = '550e8400-e29b-41d4-a716-446655440002'::UUID
);

-- Materials for second course
INSERT INTO public.materi (
  materi_id,
  kursus_id,
  title,
  description,
  material_type,
  file_url,
  file_type,
  order_index,
  duration_seconds,
  requires_completion,
  status,
  created_at
) VALUES
(
  '660e8400-e29b-41d4-a716-446655440007'::UUID,
  '550e8400-e29b-41d4-a716-446655440002'::UUID,
  'Introduction to Digital Marketing',
  'Overview of digital marketing landscape and strategies.',
  'VIDEO',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'video/mp4',
  1,
  3000,
  true,
  'ACTIVE',
  NOW()
),
(
  '660e8400-e29b-41d4-a716-446655440008'::UUID,
  '550e8400-e29b-41d4-a716-446655440002'::UUID,
  'SEO Best Practices',
  'Learn search engine optimization techniques.',
  'PDF',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  'application/pdf',
  2,
  NULL,
  true,
  'ACTIVE',
  NOW()
)
ON CONFLICT (materi_id) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if data was inserted correctly
SELECT 'Courses' as table_name, COUNT(*) as count FROM public.kursus
UNION ALL
SELECT 'Materials', COUNT(*) FROM public.materi
UNION ALL
SELECT 'Enrollments', COUNT(*) FROM public.enrollments
UNION ALL
SELECT 'Material Completions', COUNT(*) FROM public.material_completions
UNION ALL
SELECT 'Workshops', COUNT(*) FROM public.workshops
UNION ALL
SELECT 'Workshop Registrations', COUNT(*) FROM public.workshop_registrations;
