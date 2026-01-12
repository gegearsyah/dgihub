-- Migration: Add Unique Constraint for Enrollments (talenta_id, kursus_id)
-- This ensures that a talenta can only enroll once per course

DO $$
BEGIN
    -- Check if kursus_id column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'enrollments' 
        AND column_name = 'kursus_id'
    ) THEN
        -- Check if unique constraint already exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_schema = 'public' 
            AND table_name = 'enrollments' 
            AND constraint_type = 'UNIQUE'
            AND constraint_name LIKE '%talenta_id%kursus_id%'
        ) THEN
            -- First, remove any duplicate enrollments (keep the first one)
            DELETE FROM public.enrollments e1
            WHERE EXISTS (
                SELECT 1 FROM public.enrollments e2
                WHERE e2.talenta_id = e1.talenta_id
                AND e2.kursus_id = e1.kursus_id
                AND e2.kursus_id IS NOT NULL
                AND e2.id < e1.id
            );
            
            -- Add unique constraint
            ALTER TABLE public.enrollments
            ADD CONSTRAINT enrollments_talenta_kursus_unique 
            UNIQUE (talenta_id, kursus_id);
            
            RAISE NOTICE 'Added unique constraint: enrollments_talenta_kursus_unique';
        ELSE
            RAISE NOTICE 'Unique constraint on (talenta_id, kursus_id) already exists';
        END IF;
    END IF;
END $$;
