-- Add LPK (Lembaga Pelatihan Kerja) specific fields to mitra_profiles
-- Based on Indonesian Government LPK regulations

DO $$
BEGIN
    -- Add LPK License Number (Nomor Izin LPK)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'lpk_license_number'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN lpk_license_number VARCHAR(100);
        
        RAISE NOTICE 'Added lpk_license_number column';
    END IF;

    -- Add LPK Establishment Decree Number (SK Penetapan LPK)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'lpk_establishment_decree'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN lpk_establishment_decree VARCHAR(100);
        
        RAISE NOTICE 'Added lpk_establishment_decree column';
    END IF;

    -- Add BNSP Accreditation Number
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'bnsp_accreditation_number'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN bnsp_accreditation_number VARCHAR(100);
        
        RAISE NOTICE 'Added bnsp_accreditation_number column';
    END IF;

    -- Add BNSP Accreditation Date
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'bnsp_accreditation_date'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN bnsp_accreditation_date DATE;
        
        RAISE NOTICE 'Added bnsp_accreditation_date column';
    END IF;

    -- Add BNSP Accreditation Expiry Date
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'bnsp_accreditation_expiry'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN bnsp_accreditation_expiry DATE;
        
        RAISE NOTICE 'Added bnsp_accreditation_expiry column';
    END IF;

    -- Add Field of Expertise (Bidang Keahlian)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'field_of_expertise'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN field_of_expertise TEXT;
        
        RAISE NOTICE 'Added field_of_expertise column';
    END IF;

    -- Add Number of Instructors
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'number_of_instructors'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN number_of_instructors INTEGER DEFAULT 0;
        
        RAISE NOTICE 'Added number_of_instructors column';
    END IF;

    -- Add Facilities (Fasilitas)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'facilities'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN facilities TEXT;
        
        RAISE NOTICE 'Added facilities column';
    END IF;

    -- Add Training Programs (Program Pelatihan)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'training_programs'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN training_programs TEXT;
        
        RAISE NOTICE 'Added training_programs column';
    END IF;

    -- Add Bank Account Name
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'bank_account_name'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN bank_account_name VARCHAR(255);
        
        RAISE NOTICE 'Added bank_account_name column';
    END IF;

    -- Add Bank Account Number
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'bank_account_number'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN bank_account_number VARCHAR(50);
        
        RAISE NOTICE 'Added bank_account_number column';
    END IF;

    -- Add Bank Name
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'bank_name'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN bank_name VARCHAR(100);
        
        RAISE NOTICE 'Added bank_name column';
    END IF;

    -- Add Director/Leader Name
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'director_name'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN director_name VARCHAR(255);
        
        RAISE NOTICE 'Added director_name column';
    END IF;

    -- Add Director NIP (if applicable)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'director_nip'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN director_nip VARCHAR(50);
        
        RAISE NOTICE 'Added director_nip column';
    END IF;

    -- Add Legal Status (Yayasan, CV, PT, etc.)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'legal_status'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN legal_status VARCHAR(50);
        
        RAISE NOTICE 'Added legal_status column';
    END IF;

    -- Add Operational License Number
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'operational_license_number'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN operational_license_number VARCHAR(100);
        
        RAISE NOTICE 'Added operational_license_number column';
    END IF;

    -- Add Domicile Certificate URL
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'domicile_certificate_url'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN domicile_certificate_url VARCHAR(500);
        
        RAISE NOTICE 'Added domicile_certificate_url column';
    END IF;

    -- Add SIUP (Business License) URL
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'siup_url'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN siup_url VARCHAR(500);
        
        RAISE NOTICE 'Added siup_url column';
    END IF;

    -- Add LPK License Certificate URL
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'lpk_license_certificate_url'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN lpk_license_certificate_url VARCHAR(500);
        
        RAISE NOTICE 'Added lpk_license_certificate_url column';
    END IF;

    -- Add BNSP Accreditation Certificate URL
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'bnsp_certificate_url'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN bnsp_certificate_url VARCHAR(500);
        
        RAISE NOTICE 'Added bnsp_certificate_url column';
    END IF;

    -- Add Establishment Decree URL
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'establishment_decree_url'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN establishment_decree_url VARCHAR(500);
        
        RAISE NOTICE 'Added establishment_decree_url column';
    END IF;

    -- Add Years of Operation
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'years_of_operation'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN years_of_operation INTEGER;
        
        RAISE NOTICE 'Added years_of_operation column';
    END IF;

    -- Add Total Graduates
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'total_graduates'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN total_graduates INTEGER DEFAULT 0;
        
        RAISE NOTICE 'Added total_graduates column';
    END IF;

    -- Add Employee Count
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'employee_count'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN employee_count INTEGER DEFAULT 0;
        
        RAISE NOTICE 'Added employee_count column';
    END IF;

END $$;

-- Add verification_status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'mitra_profiles' 
        AND column_name = 'verification_status'
    ) THEN
        ALTER TABLE public.mitra_profiles 
        ADD COLUMN verification_status VARCHAR(50) DEFAULT 'PENDING_REVIEW' CHECK (
            verification_status IN ('PENDING_REVIEW', 'VERIFIED', 'REJECTED')
        );
        
        RAISE NOTICE 'Added verification_status column';
    END IF;
END $$;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_mitra_profiles_lpk_license ON public.mitra_profiles(lpk_license_number) WHERE lpk_license_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mitra_profiles_bnsp_accreditation ON public.mitra_profiles(bnsp_accreditation_number) WHERE bnsp_accreditation_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mitra_profiles_verification_status ON public.mitra_profiles(verification_status);
