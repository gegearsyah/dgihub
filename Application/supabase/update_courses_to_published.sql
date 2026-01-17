-- ============================================================================
-- Update Existing Courses to PUBLISHED Status
-- This script updates all DRAFT courses to PUBLISHED so they are visible to Talenta
-- ============================================================================
-- 
-- Course Visibility Rules:
-- - Talenta can only see courses with status = 'PUBLISHED'
-- - Mitra can see all their courses (DRAFT, PUBLISHED, etc.)
-- - This script ensures all courses are visible to Talenta
--
-- ============================================================================

DO $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    -- Update all DRAFT courses to PUBLISHED
    UPDATE public.kursus
    SET 
        status = 'PUBLISHED',
        published_at = COALESCE(published_at, NOW())
    WHERE status = 'DRAFT'
       OR status IS NULL
       OR (status != 'PUBLISHED' AND status != 'ARCHIVED' AND status != 'SUSPENDED');

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;

    RAISE NOTICE '✅ Updated % courses to PUBLISHED status', v_updated_count;
    RAISE NOTICE '';
    RAISE NOTICE '📊 Current Course Status Summary:';
    RAISE NOTICE '  - PUBLISHED: %', (SELECT COUNT(*) FROM public.kursus WHERE status = 'PUBLISHED');
    RAISE NOTICE '  - DRAFT: %', (SELECT COUNT(*) FROM public.kursus WHERE status = 'DRAFT');
    RAISE NOTICE '  - ARCHIVED: %', (SELECT COUNT(*) FROM public.kursus WHERE status = 'ARCHIVED');
    RAISE NOTICE '  - SUSPENDED: %', (SELECT COUNT(*) FROM public.kursus WHERE status = 'SUSPENDED');
    RAISE NOTICE '';
    RAISE NOTICE '✅ All courses are now visible to Talenta users!';
END $$;
