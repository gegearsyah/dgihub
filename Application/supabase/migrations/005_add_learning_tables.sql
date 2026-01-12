-- Migration: Add Learning Experience Tables
-- This migration adds tables for course materials, quizzes, workshops, and attendance

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. CREATE KURSUS TABLE (if using kursus instead of courses)
-- ============================================================================

-- Check if kursus table exists, if not create it
-- If courses table exists, we'll use that instead
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'kursus') THEN
        CREATE TABLE public.kursus (
            kursus_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            mitra_id UUID NOT NULL,
            title VARCHAR(255) NOT NULL,
            title_en VARCHAR(255),
            description TEXT,
            description_en TEXT,
            category VARCHAR(100),
            skkni_code VARCHAR(100),
            skkni_name VARCHAR(255),
            aqrf_level INTEGER CHECK (aqrf_level BETWEEN 1 AND 8),
            duration_hours INTEGER NOT NULL,
            duration_days INTEGER,
            price DECIMAL(15, 2) DEFAULT 0,
            currency VARCHAR(3) DEFAULT 'IDR',
            prerequisites JSONB,
            learning_outcomes JSONB,
            status VARCHAR(50) DEFAULT 'DRAFT' CHECK (
                status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SUSPENDED')
            ),
            siplatih_program_id VARCHAR(100),
            siplatih_registered BOOLEAN DEFAULT FALSE,
            siplatih_registered_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            published_at TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_kursus_mitra_id ON public.kursus(mitra_id);
        CREATE INDEX IF NOT EXISTS idx_kursus_status ON public.kursus(status);
        CREATE INDEX IF NOT EXISTS idx_kursus_skkni_code ON public.kursus(skkni_code);
        CREATE INDEX IF NOT EXISTS idx_kursus_aqrf_level ON public.kursus(aqrf_level);
    END IF;
END $$;

-- ============================================================================
-- 2. CREATE MATERI (MATERIALS) TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.materi (
    materi_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kursus_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    material_type VARCHAR(50) NOT NULL CHECK (
        material_type IN ('VIDEO', 'PDF', 'DOCUMENT', 'IMAGE', 'AUDIO', 'LINK', 'QUIZ')
    ),
    file_url VARCHAR(500),
    file_size BIGINT,
    file_type VARCHAR(100),
    thumbnail_url VARCHAR(500),
    module_number INTEGER,
    lesson_number INTEGER,
    order_index INTEGER DEFAULT 0,
    duration_seconds INTEGER,
    is_preview BOOLEAN DEFAULT FALSE,
    requires_completion BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (
        status IN ('ACTIVE', 'ARCHIVED', 'DRAFT')
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_materi_kursus FOREIGN KEY (kursus_id) 
        REFERENCES public.kursus(kursus_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_materi_kursus_id ON public.materi(kursus_id);
CREATE INDEX IF NOT EXISTS idx_materi_order ON public.materi(kursus_id, order_index);

-- ============================================================================
-- 3. UPDATE ENROLLMENTS TABLE (add missing columns if needed)
-- ============================================================================

DO $$
BEGIN
    -- Add kursus_id column if it doesn't exist (for compatibility)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'enrollments' 
        AND column_name = 'kursus_id'
    ) THEN
        -- Add kursus_id column
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
    
    -- Add progress column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'enrollments' 
        AND column_name = 'progress'
    ) THEN
        ALTER TABLE public.enrollments 
        ADD COLUMN progress DECIMAL(5, 2) DEFAULT 0;
    END IF;
    
    -- Add certificate_issued column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'enrollments' 
        AND column_name = 'certificate_issued'
    ) THEN
        ALTER TABLE public.enrollments 
        ADD COLUMN certificate_issued BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Note: Foreign key constraints will be added in migration 006_fix_enrollments_foreign_keys.sql
    -- This avoids errors if enrollments table has existing data with invalid foreign keys
END $$;

-- ============================================================================
-- 4. CREATE MATERIAL COMPLETIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.material_completions (
    materi_id UUID NOT NULL,
    talenta_id UUID NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (materi_id, talenta_id),
    CONSTRAINT fk_completion_materi FOREIGN KEY (materi_id) 
        REFERENCES public.materi(materi_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_completions_talenta ON public.material_completions(talenta_id);
CREATE INDEX IF NOT EXISTS idx_completions_materi ON public.material_completions(materi_id);

-- ============================================================================
-- 5. CREATE QUIZ SUBMISSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.quiz_submissions (
    submission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    materi_id UUID NOT NULL,
    talenta_id UUID NOT NULL,
    answers JSONB NOT NULL,
    score INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_submission_materi FOREIGN KEY (materi_id) 
        REFERENCES public.materi(materi_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_submissions_talenta ON public.quiz_submissions(talenta_id);
CREATE INDEX IF NOT EXISTS idx_submissions_materi ON public.quiz_submissions(materi_id);

-- ============================================================================
-- 6. CREATE WORKSHOPS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.workshops (
    workshop_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mitra_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    location_name VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    capacity INTEGER,
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (
        status IN ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED')
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workshops_mitra ON public.workshops(mitra_id);
CREATE INDEX IF NOT EXISTS idx_workshops_status ON public.workshops(status);

-- ============================================================================
-- 7. CREATE WORKSHOP REGISTRATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.workshop_registrations (
    registration_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID NOT NULL,
    talenta_id UUID NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'CONFIRMED' CHECK (
        status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'ATTENDED')
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_registration_workshop FOREIGN KEY (workshop_id) 
        REFERENCES public.workshops(workshop_id) ON DELETE CASCADE,
    UNIQUE(workshop_id, talenta_id)
);

CREATE INDEX IF NOT EXISTS idx_registrations_workshop ON public.workshop_registrations(workshop_id);
CREATE INDEX IF NOT EXISTS idx_registrations_talenta ON public.workshop_registrations(talenta_id);

-- ============================================================================
-- 8. CREATE WORKSHOP ATTENDANCE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.workshop_attendance (
    attendance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID NOT NULL,
    talenta_id UUID NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'PRESENT' CHECK (
        status IN ('PRESENT', 'ABSENT', 'LATE')
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_workshop FOREIGN KEY (workshop_id) 
        REFERENCES public.workshops(workshop_id) ON DELETE CASCADE,
    UNIQUE(workshop_id, talenta_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_workshop ON public.workshop_attendance(workshop_id);
CREATE INDEX IF NOT EXISTS idx_attendance_talenta ON public.workshop_attendance(talenta_id);

-- ============================================================================
-- 9. CREATE MITRA PROFILES TABLE (if needed for foreign keys)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mitra_profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    organization_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key to kursus if mitra_profiles exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'mitra_profiles') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_schema = 'public'
            AND table_name = 'kursus'
            AND constraint_name = 'fk_kursus_mitra'
        ) THEN
            -- Only add constraint if all mitra_id values in kursus exist in mitra_profiles
            IF NOT EXISTS (
                SELECT 1 FROM public.kursus k
                WHERE k.mitra_id IS NOT NULL
                AND NOT EXISTS (
                    SELECT 1 FROM public.mitra_profiles m WHERE m.profile_id = k.mitra_id
                )
            ) THEN
                ALTER TABLE public.kursus
                ADD CONSTRAINT fk_kursus_mitra 
                FOREIGN KEY (mitra_id) 
                REFERENCES public.mitra_profiles(profile_id) ON DELETE CASCADE;
            ELSE
                RAISE NOTICE 'Skipping foreign key constraint: kursus contains mitra_id values that do not exist in mitra_profiles. Please clean up data first.';
            END IF;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- 10. CREATE TALENTA PROFILES TABLE (if needed)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.talenta_profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign keys if talenta_profiles exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'talenta_profiles') THEN
        -- Update enrollments foreign key
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'enrollments' 
            AND column_name = 'talenta_id'
        ) THEN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_schema = 'public'
                AND table_name = 'enrollments'
                AND constraint_name = 'fk_enrollments_talenta'
            ) THEN
                -- Note: Foreign key constraint will be added in migration 006_fix_enrollments_foreign_keys.sql
                -- This avoids errors if enrollments table has existing data with invalid foreign keys
            END IF;
        END IF;
    END IF;
END $$;
