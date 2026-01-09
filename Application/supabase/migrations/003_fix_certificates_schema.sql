-- Migration to fix certificates table schema
-- Adds missing columns: expiration_date and status

-- Add expiration_date column if it doesn't exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'certificates'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'certificates' 
        AND column_name = 'expiration_date'
    ) THEN
        ALTER TABLE public.certificates 
            ADD COLUMN expiration_date TIMESTAMPTZ;
    END IF;
END $$;

-- Add status column if it doesn't exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'certificates'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'certificates' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.certificates 
            ADD COLUMN status TEXT DEFAULT 'ACTIVE' 
            CHECK (status IN ('ACTIVE', 'EXPIRED', 'REVOKED'));
    END IF;
END $$;

-- Update aqrf_level to be INTEGER instead of TEXT if it's currently TEXT
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'certificates' 
        AND column_name = 'aqrf_level'
        AND data_type = 'text'
    ) THEN
        -- First, update any existing text values to integers (if possible)
        UPDATE public.certificates 
        SET aqrf_level = CASE 
            WHEN aqrf_level ~ '^[0-9]+$' THEN aqrf_level
            ELSE NULL
        END
        WHERE aqrf_level IS NOT NULL;
        
        -- Change column type to INTEGER
        ALTER TABLE public.certificates 
            ALTER COLUMN aqrf_level TYPE INTEGER 
            USING CASE 
                WHEN aqrf_level ~ '^[0-9]+$' THEN aqrf_level::INTEGER
                ELSE NULL
            END;
    END IF;
END $$;

-- Create index on status for better query performance
CREATE INDEX IF NOT EXISTS idx_certificates_status ON public.certificates(status);

-- Create index on expiration_date for better query performance
CREATE INDEX IF NOT EXISTS idx_certificates_expiration_date ON public.certificates(expiration_date);

-- Create index on talenta_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_certificates_talenta_id ON public.certificates(talenta_id);

-- Create index on course_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON public.certificates(course_id);

-- Create index on mitra_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_certificates_mitra_id ON public.certificates(mitra_id);

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'certificates'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'certificates' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.certificates 
            ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_certificates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_certificates_updated_at_trigger ON public.certificates;
CREATE TRIGGER update_certificates_updated_at_trigger
    BEFORE UPDATE ON public.certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_certificates_updated_at();
