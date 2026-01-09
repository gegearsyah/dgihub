-- Migration to add organization_name to mitra_profiles table
-- This is needed for certificate issuer information

-- Add organization_name column to mitra_profiles if it doesn't exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'organization_name'
    ) THEN
        ALTER TABLE public.mitra_profiles 
            ADD COLUMN organization_name TEXT;
    END IF;
END $$;

-- Add other useful columns to mitra_profiles
DO $$
BEGIN
    -- Add organization_type if it doesn't exist
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'organization_type'
    ) THEN
        ALTER TABLE public.mitra_profiles 
            ADD COLUMN organization_type TEXT 
            CHECK (organization_type IN ('LPK', 'SMK', 'UNIVERSITAS', 'OTHER'));
    END IF;

    -- Add address if it doesn't exist
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'address'
    ) THEN
        ALTER TABLE public.mitra_profiles 
            ADD COLUMN address TEXT;
    END IF;

    -- Add phone if it doesn't exist
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.mitra_profiles 
            ADD COLUMN phone VARCHAR(20);
    END IF;

    -- Add email if it doesn't exist
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.mitra_profiles 
            ADD COLUMN email TEXT;
    END IF;
END $$;

-- Create index on organization_name for better query performance
CREATE INDEX IF NOT EXISTS idx_mitra_profiles_organization_name ON public.mitra_profiles(organization_name);
