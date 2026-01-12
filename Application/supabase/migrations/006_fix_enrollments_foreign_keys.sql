-- Migration: Fix Enrollments Foreign Keys
-- This migration safely adds foreign key constraints to enrollments table
-- It handles existing data that might not have matching records

-- ============================================================================
-- 1. ENSURE KURSUS_ID COLUMN EXISTS
-- ============================================================================

-- Add kursus_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'enrollments' 
        AND column_name = 'kursus_id'
    ) THEN
        ALTER TABLE public.enrollments 
        ADD COLUMN kursus_id UUID;
        
        -- If course_id exists, copy data
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'enrollments' 
            AND column_name = 'course_id'
        ) THEN
            UPDATE public.enrollments 
            SET kursus_id = course_id 
            WHERE kursus_id IS NULL;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- 2. CLEAN UP INVALID ENROLLMENTS DATA
-- ============================================================================

-- Remove enrollments with kursus_id that don't exist in kursus table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'enrollments' 
        AND column_name = 'kursus_id'
    ) AND EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'kursus') THEN
        DELETE FROM public.enrollments
        WHERE kursus_id IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM public.kursus k WHERE k.kursus_id = enrollments.kursus_id
        );
    END IF;
END $$;

-- Remove enrollments with talenta_id that don't exist in talenta_profiles
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'enrollments' 
        AND column_name = 'talenta_id'
    ) AND EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'talenta_profiles') THEN
        DELETE FROM public.enrollments
        WHERE talenta_id IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM public.talenta_profiles t WHERE t.profile_id = enrollments.talenta_id
        );
    END IF;
END $$;

-- ============================================================================
-- 2. ADD FOREIGN KEY CONSTRAINTS (if they don't exist)
-- ============================================================================

-- Add kursus foreign key
DO $$
BEGIN
    -- Check if kursus_id column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'enrollments' 
        AND column_name = 'kursus_id'
    ) AND EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'kursus') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_schema = 'public' 
            AND table_name = 'enrollments' 
            AND constraint_name = 'fk_enrollments_kursus'
        ) THEN
            -- Check if there are any invalid kursus_id values
            IF NOT EXISTS (
                SELECT 1 FROM public.enrollments e
                WHERE e.kursus_id IS NOT NULL
                AND NOT EXISTS (
                    SELECT 1 FROM public.kursus k WHERE k.kursus_id = e.kursus_id
                )
            ) THEN
                ALTER TABLE public.enrollments
                ADD CONSTRAINT fk_enrollments_kursus 
                FOREIGN KEY (kursus_id) 
                REFERENCES public.kursus(kursus_id) ON DELETE CASCADE;
                
                RAISE NOTICE 'Added foreign key constraint: fk_enrollments_kursus';
            ELSE
                RAISE NOTICE 'Cannot add foreign key: enrollments contains invalid kursus_id values';
            END IF;
        END IF;
    END IF;
END $$;

-- Add talenta_profiles foreign key
DO $$
BEGIN
    -- Check if talenta_id column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'enrollments' 
        AND column_name = 'talenta_id'
    ) AND EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'talenta_profiles') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_schema = 'public' 
            AND table_name = 'enrollments' 
            AND constraint_name = 'fk_enrollments_talenta'
        ) THEN
            -- Check if there are any invalid talenta_id values
            IF NOT EXISTS (
                SELECT 1 FROM public.enrollments e
                WHERE e.talenta_id IS NOT NULL
                AND NOT EXISTS (
                    SELECT 1 FROM public.talenta_profiles t WHERE t.profile_id = e.talenta_id
                )
            ) THEN
                ALTER TABLE public.enrollments
                ADD CONSTRAINT fk_enrollments_talenta 
                FOREIGN KEY (talenta_id) 
                REFERENCES public.talenta_profiles(profile_id) ON DELETE CASCADE;
                
                RAISE NOTICE 'Added foreign key constraint: fk_enrollments_talenta';
            ELSE
                RAISE NOTICE 'Cannot add foreign key: enrollments contains invalid talenta_id values';
            END IF;
        END IF;
    END IF;
END $$;
