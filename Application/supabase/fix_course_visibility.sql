-- ============================================================================
-- Fix Course Visibility Issues
-- This script ensures all necessary data is in place for courses to be visible
-- ============================================================================

DO $$
DECLARE
    v_mitra_user_id UUID;
    v_mitra_profile_id UUID;
    v_course_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'FIXING COURSE VISIBILITY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';

    -- 1. Ensure mitra1@demo.com has organization_name
    SELECT u.user_id INTO v_mitra_user_id
    FROM public.users u
    WHERE u.email = 'mitra1@demo.com' AND u.user_type = 'MITRA'
    LIMIT 1;

    IF v_mitra_user_id IS NOT NULL THEN
        SELECT profile_id INTO v_mitra_profile_id
        FROM public.mitra_profiles
        WHERE user_id = v_mitra_user_id
        LIMIT 1;

        IF v_mitra_profile_id IS NOT NULL THEN
            UPDATE public.mitra_profiles
            SET organization_name = COALESCE(organization_name, 'LPK Teknologi Indonesia')
            WHERE profile_id = v_mitra_profile_id
            AND (organization_name IS NULL OR organization_name = '');

            RAISE NOTICE '✅ Updated mitra1@demo.com organization_name';
        END IF;
    END IF;

    -- 2. Ensure ALL mitra profiles have organization_name
    UPDATE public.mitra_profiles mp
    SET organization_name = COALESCE(
        mp.organization_name,
        u.full_name,
        'LPK Provider'
    )
    FROM public.users u
    WHERE mp.user_id = u.user_id
    AND u.user_type = 'MITRA'
    AND (mp.organization_name IS NULL OR mp.organization_name = '');

    GET DIAGNOSTICS v_course_count = ROW_COUNT;
    RAISE NOTICE '✅ Updated % mitra profiles with organization_name', v_course_count;

    -- 3. Ensure ALL courses are PUBLISHED (if they have mitra_id)
    UPDATE public.kursus
    SET status = 'PUBLISHED'
    WHERE status = 'DRAFT'
    AND mitra_id IS NOT NULL;

    GET DIAGNOSTICS v_course_count = ROW_COUNT;
    RAISE NOTICE '✅ Published % courses', v_course_count;

    -- 4. Ensure all courses have published_at timestamp
    UPDATE public.kursus
    SET published_at = COALESCE(published_at, created_at, NOW())
    WHERE status = 'PUBLISHED'
    AND published_at IS NULL;

    GET DIAGNOSTICS v_course_count = ROW_COUNT;
    RAISE NOTICE '✅ Updated % courses with published_at', v_course_count;

    -- 5. Count final state
    SELECT COUNT(*) INTO v_course_count
    FROM public.kursus
    WHERE status = 'PUBLISHED';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SUMMARY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total published courses: %', v_course_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Course visibility should now be fixed!';
    RAISE NOTICE '';
END $$;

-- Verify the fix
SELECT 
    k.kursus_id,
    k.title,
    k.status,
    mp.organization_name as provider_name,
    CASE 
        WHEN k.status != 'PUBLISHED' THEN '❌ Not Published'
        WHEN mp.organization_name IS NULL OR mp.organization_name = '' THEN '❌ Missing Provider Name'
        ELSE '✅ Visible'
    END as visibility_status
FROM public.kursus k
LEFT JOIN public.mitra_profiles mp ON k.mitra_id = mp.profile_id
ORDER BY k.created_at DESC
LIMIT 10;
