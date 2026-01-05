-- Migration to fix users table schema to match application code
-- This adds missing columns and fixes the table structure

-- Ensure uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table if it doesn't exist (with correct structure)
CREATE TABLE IF NOT EXISTS public.users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('TALENTA', 'MITRA', 'INDUSTRI')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Check if password_hash column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE public.users ADD COLUMN password_hash VARCHAR(255);
    END IF;

    -- Check if user_id column exists, if not rename id to user_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.users RENAME COLUMN id TO user_id;
        -- Remove the foreign key constraint to auth.users if it exists
        ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
        -- Add default UUID generation
        ALTER TABLE public.users ALTER COLUMN user_id SET DEFAULT uuid_generate_v4();
    END IF;

    -- Ensure user_id has a default value (check if default is missing)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'user_id'
        AND (column_default IS NULL OR column_default NOT LIKE '%uuid_generate_v4%')
    ) THEN
        ALTER TABLE public.users ALTER COLUMN user_id SET DEFAULT uuid_generate_v4();
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.users ADD COLUMN status VARCHAR(20) DEFAULT 'PENDING_VERIFICATION' 
            CHECK (status IN ('PENDING_VERIFICATION', 'VERIFIED', 'ACTIVE', 'SUSPENDED', 'REJECTED'));
    END IF;

    -- Add verification_code if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'verification_code'
    ) THEN
        ALTER TABLE public.users ADD COLUMN verification_code VARCHAR(10);
    END IF;

    -- Add verification_code_expires_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'verification_code_expires_at'
    ) THEN
        ALTER TABLE public.users ADD COLUMN verification_code_expires_at TIMESTAMPTZ;
    END IF;

    -- Add email_verified if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'email_verified'
    ) THEN
        ALTER TABLE public.users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add email_verified_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'email_verified_at'
    ) THEN
        ALTER TABLE public.users ADD COLUMN email_verified_at TIMESTAMPTZ;
    END IF;

    -- Add last_login_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'last_login_at'
    ) THEN
        ALTER TABLE public.users ADD COLUMN last_login_at TIMESTAMPTZ;
    END IF;

    -- Add profile_complete if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'profile_complete'
    ) THEN
        ALTER TABLE public.users ADD COLUMN profile_complete BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add metadata if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE public.users ADD COLUMN metadata JSONB;
    END IF;
END $$;

-- Make password_hash NOT NULL if it's currently nullable (for new records)
-- But only if the table is empty or we're okay with setting defaults
DO $$
BEGIN
    -- Only make it NOT NULL if there are no existing rows, or set a default
    IF NOT EXISTS (SELECT 1 FROM public.users LIMIT 1) THEN
        ALTER TABLE public.users ALTER COLUMN password_hash SET NOT NULL;
    END IF;
END $$;

-- Create profile tables FIRST (before adding foreign keys that reference them)
CREATE TABLE IF NOT EXISTS public.talenta_profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(user_id) ON DELETE CASCADE,
    nik VARCHAR(50) UNIQUE,
    phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mitra_profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.industri_profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update foreign key references from 'id' to 'user_id' in other tables
-- Update courses table - mitra_id should reference mitra_profiles, not users
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'mitra_id'
    ) THEN
        -- Drop old foreign key
        ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_mitra_id_fkey;
        -- Add new foreign key referencing mitra_profiles
        ALTER TABLE public.courses 
            ADD CONSTRAINT courses_mitra_id_fkey 
            FOREIGN KEY (mitra_id) REFERENCES public.mitra_profiles(profile_id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update enrollments table - talenta_id should reference talenta_profiles
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'enrollments' 
        AND column_name = 'talenta_id'
    ) THEN
        ALTER TABLE public.enrollments DROP CONSTRAINT IF EXISTS enrollments_talenta_id_fkey;
        ALTER TABLE public.enrollments 
            ADD CONSTRAINT enrollments_talenta_id_fkey 
            FOREIGN KEY (talenta_id) REFERENCES public.talenta_profiles(profile_id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update certificates table - should reference profiles
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'certificates' 
        AND column_name = 'talenta_id'
    ) THEN
        ALTER TABLE public.certificates DROP CONSTRAINT IF EXISTS certificates_talenta_id_fkey;
        ALTER TABLE public.certificates DROP CONSTRAINT IF EXISTS certificates_mitra_id_fkey;
        ALTER TABLE public.certificates 
            ADD CONSTRAINT certificates_talenta_id_fkey 
            FOREIGN KEY (talenta_id) REFERENCES public.talenta_profiles(profile_id) ON DELETE CASCADE;
        ALTER TABLE public.certificates 
            ADD CONSTRAINT certificates_mitra_id_fkey 
            FOREIGN KEY (mitra_id) REFERENCES public.mitra_profiles(profile_id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update job_postings table - should reference industri_profiles
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'job_postings' 
        AND column_name = 'industri_id'
    ) THEN
        ALTER TABLE public.job_postings DROP CONSTRAINT IF EXISTS job_postings_industri_id_fkey;
        ALTER TABLE public.job_postings 
            ADD CONSTRAINT job_postings_industri_id_fkey 
            FOREIGN KEY (industri_id) REFERENCES public.industri_profiles(profile_id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update job_applications table - should reference talenta_profiles
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'job_applications' 
        AND column_name = 'talenta_id'
    ) THEN
        ALTER TABLE public.job_applications DROP CONSTRAINT IF EXISTS job_applications_talenta_id_fkey;
        ALTER TABLE public.job_applications 
            ADD CONSTRAINT job_applications_talenta_id_fkey 
            FOREIGN KEY (talenta_id) REFERENCES public.talenta_profiles(profile_id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add status column to courses table if it doesn't exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'courses'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.courses ADD COLUMN status TEXT DEFAULT 'DRAFT' 
            CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'));
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON public.users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_talenta_profiles_user_id ON public.talenta_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mitra_profiles_user_id ON public.mitra_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_industri_profiles_user_id ON public.industri_profiles(user_id);

