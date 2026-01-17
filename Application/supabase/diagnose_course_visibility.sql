-- ============================================================================
-- Diagnostic Script: Check why courses are not showing for Talenta users
-- ============================================================================

DO $$
DECLARE
    v_talenta_user_id UUID;
    v_talenta_profile_id UUID;
    v_mitra_profile_id UUID;
    v_course_count INTEGER;
    v_published_course_count INTEGER;
    v_enrollment_count INTEGER;
    v_mitra_org_name TEXT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'COURSE VISIBILITY DIAGNOSTIC';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';

    -- 1. Check if talenta1@demo.com exists
    SELECT user_id INTO v_talenta_user_id
    FROM public.users
    WHERE email = 'talenta1@demo.com' AND user_type = 'TALENTA'
    LIMIT 1;

    IF v_talenta_user_id IS NULL THEN
        RAISE NOTICE '❌ ERROR: talenta1@demo.com user NOT FOUND!';
    ELSE
        RAISE NOTICE '✅ talenta1@demo.com user found: %', v_talenta_user_id;
    END IF;

    -- 2. Check if talenta profile exists
    SELECT profile_id INTO v_talenta_profile_id
    FROM public.talenta_profiles
    WHERE user_id = v_talenta_user_id
    LIMIT 1;

    IF v_talenta_profile_id IS NULL THEN
        RAISE NOTICE '❌ ERROR: Talenta profile NOT FOUND for talenta1@demo.com!';
    ELSE
        RAISE NOTICE '✅ Talenta profile found: %', v_talenta_profile_id;
    END IF;

    -- 3. Check if mitra1@demo.com exists and has profile
    SELECT mp.profile_id INTO v_mitra_profile_id
    FROM public.mitra_profiles mp
    JOIN public.users u ON mp.user_id = u.user_id
    WHERE u.email = 'mitra1@demo.com' AND u.user_type = 'MITRA'
    LIMIT 1;

    IF v_mitra_profile_id IS NULL THEN
        RAISE NOTICE '❌ ERROR: mitra1@demo.com profile NOT FOUND!';
    ELSE
        RAISE NOTICE '✅ Mitra profile found: %', v_mitra_profile_id;
        
        -- Check organization_name
        SELECT organization_name INTO v_mitra_org_name
        FROM public.mitra_profiles
        WHERE profile_id = v_mitra_profile_id;
        
        IF v_mitra_org_name IS NULL OR v_mitra_org_name = '' THEN
            RAISE NOTICE '❌ ERROR: Mitra organization_name is NULL or empty!';
        ELSE
            RAISE NOTICE '✅ Mitra organization_name: %', v_mitra_org_name;
        END IF;
    END IF;

    -- 4. Check total courses
    SELECT COUNT(*) INTO v_course_count FROM public.kursus;
    RAISE NOTICE '';
    RAISE NOTICE 'Total courses in database: %', v_course_count;

    -- 5. Check published courses
    SELECT COUNT(*) INTO v_published_course_count
    FROM public.kursus
    WHERE status = 'PUBLISHED';
    RAISE NOTICE 'Published courses: %', v_published_course_count;

    -- 6. Check courses owned by mitra1@demo.com
    SELECT COUNT(*) INTO v_course_count
    FROM public.kursus
    WHERE mitra_id = v_mitra_profile_id AND status = 'PUBLISHED';
    RAISE NOTICE 'Published courses by mitra1@demo.com: %', v_course_count;

    -- 7. Check enrollments for talenta1@demo.com
    SELECT COUNT(*) INTO v_enrollment_count
    FROM public.enrollments
    WHERE talenta_id = v_talenta_profile_id;
    RAISE NOTICE '';
    RAISE NOTICE 'Enrollments for talenta1@demo.com: %', v_enrollment_count;

    -- 8. List all published courses with their mitra info
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PUBLISHED COURSES DETAILS:';
    RAISE NOTICE '========================================';
    -- Count published courses
    SELECT COUNT(*) INTO v_course_count
    FROM public.kursus k
    LEFT JOIN public.mitra_profiles mp ON k.mitra_id = mp.profile_id
    WHERE k.status = 'PUBLISHED';
    RAISE NOTICE 'Total published courses: %', v_course_count;

    -- 9. Test the exact query used by the API
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'API QUERY TEST (what Talenta sees):';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'See the query results below for courses that should be visible';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RECOMMENDATIONS:';
    RAISE NOTICE '========================================';
    
    IF v_published_course_count = 0 THEN
        RAISE NOTICE '⚠️  No published courses found. Run: UPDATE public.kursus SET status = ''PUBLISHED'' WHERE status = ''DRAFT'';';
    END IF;
    
    IF v_mitra_org_name IS NULL OR v_mitra_org_name = '' THEN
        RAISE NOTICE '⚠️  Mitra organization_name is missing. Run: Application/supabase/update_profiles_complete_data.sql';
    END IF;
    
    IF v_enrollment_count = 0 AND v_talenta_profile_id IS NOT NULL THEN
        RAISE NOTICE '⚠️  No enrollments found. Run: Application/supabase/seed_comprehensive_data.sql';
    END IF;

    RAISE NOTICE '';
END $$;

-- Also run a direct query to show courses
SELECT 
    k.kursus_id,
    k.title,
    k.status,
    mp.organization_name as provider_name,
    mp.profile_id as mitra_profile_id,
    CASE WHEN mp.organization_name IS NULL THEN '❌ MISSING' ELSE '✅ OK' END as mitra_status
FROM public.kursus k
LEFT JOIN public.mitra_profiles mp ON k.mitra_id = mp.profile_id
WHERE k.status = 'PUBLISHED'
ORDER BY k.created_at DESC
LIMIT 10;

-- Check enrollments
-- Note: Primary key is 'id', but we'll select it as 'enrollment_id' for consistency
SELECT 
    e.id as enrollment_id,
    e.talenta_id,
    e.kursus_id,
    e.status,
    e.progress,
    k.title as course_title,
    u.email as talenta_email
FROM public.enrollments e
JOIN public.kursus k ON e.kursus_id = k.kursus_id
JOIN public.talenta_profiles tp ON e.talenta_id = tp.profile_id
JOIN public.users u ON tp.user_id = u.user_id
WHERE u.email = 'talenta1@demo.com'
LIMIT 10;
