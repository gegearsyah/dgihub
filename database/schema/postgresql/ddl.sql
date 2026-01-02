-- ============================================================================
-- DGIHub Database Schema
-- Based on Flow Chart Platform Logic
-- PostgreSQL DDL
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USER TABLES: Unified table with roles
-- Flow Chart Nodes: [5, 8, 11]
-- ============================================================================

-- Unified Users Table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('TALENTA', 'MITRA', 'INDUSTRI')),
    status VARCHAR(20) DEFAULT 'PENDING_VERIFICATION' CHECK (
        status IN ('PENDING_VERIFICATION', 'VERIFIED', 'ACTIVE', 'SUSPENDED', 'REJECTED')
    ),
    
    -- Verification fields
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    verification_code VARCHAR(10),
    verification_code_expires_at TIMESTAMP,
    
    -- Profile completion
    profile_complete BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Talenta Profile (Flow Chart Node: [11])
CREATE TABLE talenta_profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Personal information
    nik VARCHAR(50) UNIQUE,
    nik_verified BOOLEAN DEFAULT FALSE,
    nik_verified_at TIMESTAMP,
    date_of_birth DATE,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(10),
    
    -- e-KYC
    ekyc_verified BOOLEAN DEFAULT FALSE,
    ekyc_verified_at TIMESTAMP,
    biometric_type VARCHAR(50) CHECK (biometric_type IN ('FINGERPRINT', 'FACE', 'IRIS')),
    biometric_hash VARCHAR(64),
    
    -- Skills and competencies
    skills JSONB, -- Array of {name, level, verified}
    aqrf_level INTEGER CHECK (aqrf_level BETWEEN 1 AND 8),
    
    -- Resume and portfolio
    resume_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    
    -- Preferences
    job_preferences JSONB, -- {locations, salaryRange, jobTypes}
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_talenta_profiles_user_id ON talenta_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_talenta_profiles_nik ON talenta_profiles(nik) WHERE nik IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_talenta_profiles_skills ON talenta_profiles USING GIN (skills);

-- Mitra Profile (Flow Chart Node: [8])
CREATE TABLE mitra_profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Organization information
    organization_name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    tax_id VARCHAR(50),
    accreditation_status VARCHAR(50) DEFAULT 'PENDING' CHECK (
        accreditation_status IN ('PENDING', 'ACCREDITED', 'EXPIRED', 'REVOKED')
    ),
    accreditation_expires_at TIMESTAMP,
    
    -- Contact information
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(10),
    phone VARCHAR(20),
    website VARCHAR(255),
    
    -- Contact person
    contact_person_name VARCHAR(255),
    contact_person_email VARCHAR(255),
    contact_person_phone VARCHAR(20),
    contact_person_position VARCHAR(100),
    
    -- Documents
    registration_certificate_url VARCHAR(500),
    tax_certificate_url VARCHAR(500),
    accreditation_letter_url VARCHAR(500),
    
    -- Verification
    verification_status VARCHAR(50) DEFAULT 'PENDING_REVIEW' CHECK (
        verification_status IN ('PENDING_REVIEW', 'VERIFIED', 'REJECTED')
    ),
    verified_at TIMESTAMP,
    verified_by UUID, -- Admin user ID
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mitra_profiles_user_id ON mitra_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mitra_profiles_registration_number ON mitra_profiles(registration_number);
CREATE INDEX IF NOT EXISTS idx_mitra_profiles_accreditation_status ON mitra_profiles(accreditation_status);

-- Industri Profile (Flow Chart Node: [5])
CREATE TABLE industri_profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Company information
    company_name VARCHAR(255) NOT NULL,
    company_tax_id VARCHAR(50) UNIQUE NOT NULL, -- NPWP
    company_type VARCHAR(100), -- PT, CV, etc.
    industry_sector VARCHAR(100),
    
    -- Address
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(10),
    phone VARCHAR(20),
    website VARCHAR(255),
    
    -- Contact person
    contact_person_name VARCHAR(255),
    contact_person_email VARCHAR(255),
    contact_person_phone VARCHAR(20),
    contact_person_position VARCHAR(100),
    
    -- Documents
    company_registration_url VARCHAR(500),
    tax_certificate_url VARCHAR(500),
    business_license_url VARCHAR(500),
    
    -- Verification
    verification_status VARCHAR(50) DEFAULT 'PENDING_REVIEW' CHECK (
        verification_status IN ('PENDING_REVIEW', 'VERIFIED', 'REJECTED')
    ),
    verified_at TIMESTAMP,
    verified_by UUID, -- Admin user ID
    
    -- Tax incentive tracking
    tax_incentive_eligible BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_industri_profiles_user_id ON industri_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_industri_profiles_company_tax_id ON industri_profiles(company_tax_id);
CREATE INDEX IF NOT EXISTS idx_industri_profiles_verification_status ON industri_profiles(verification_status);

-- ============================================================================
-- 2. MITRA MODULES: Kursus, Workshop, Materi
-- Flow Chart Nodes: [27, 28, 34]
-- ============================================================================

-- Kursus (Course) Table (Flow Chart Node: [27])
CREATE TABLE kursus (
    kursus_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mitra_id UUID NOT NULL REFERENCES mitra_profiles(profile_id) ON DELETE CASCADE,
    
    -- Course information
    title VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    description TEXT,
    description_en TEXT,
    category VARCHAR(100),
    
    -- SKKNI and AQRF
    skkni_code VARCHAR(100),
    skkni_name VARCHAR(255),
    aqrf_level INTEGER CHECK (aqrf_level BETWEEN 1 AND 8),
    
    -- Duration and pricing
    duration_hours INTEGER NOT NULL,
    duration_days INTEGER,
    price DECIMAL(15, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'IDR',
    
    -- Prerequisites
    prerequisites JSONB, -- Array of course IDs or certificate requirements
    
    -- Learning outcomes
    learning_outcomes JSONB, -- Array of outcomes
    
    -- Status
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (
        status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SUSPENDED')
    ),
    
    -- SIPLatih integration
    siplatih_program_id VARCHAR(100),
    siplatih_registered BOOLEAN DEFAULT FALSE,
    siplatih_registered_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kursus_mitra_id ON kursus(mitra_id);
CREATE INDEX IF NOT EXISTS idx_kursus_status ON kursus(status);
CREATE INDEX IF NOT EXISTS idx_kursus_skkni_code ON kursus(skkni_code);
CREATE INDEX IF NOT EXISTS idx_kursus_aqrf_level ON kursus(aqrf_level);

-- Materi (Course Materials) Table (Flow Chart Node: [34])
CREATE TABLE materi (
    materi_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kursus_id UUID NOT NULL REFERENCES kursus(kursus_id) ON DELETE CASCADE,
    
    -- Material information
    title VARCHAR(255) NOT NULL,
    description TEXT,
    material_type VARCHAR(50) NOT NULL CHECK (
        material_type IN ('VIDEO', 'PDF', 'DOCUMENT', 'IMAGE', 'AUDIO', 'LINK', 'QUIZ')
    ),
    
    -- File storage
    file_url VARCHAR(500),
    file_size BIGINT, -- in bytes
    file_type VARCHAR(100), -- MIME type
    thumbnail_url VARCHAR(500),
    
    -- Order and organization
    module_number INTEGER,
    lesson_number INTEGER,
    order_index INTEGER DEFAULT 0,
    
    -- Duration (for videos)
    duration_seconds INTEGER,
    
    -- Access control
    is_preview BOOLEAN DEFAULT FALSE,
    requires_completion BOOLEAN DEFAULT TRUE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (
        status IN ('ACTIVE', 'ARCHIVED', 'DRAFT')
    ),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_materi_kursus_id ON materi(kursus_id);
CREATE INDEX IF NOT EXISTS idx_materi_order ON materi(kursus_id, order_index);

-- Course Enrollments
CREATE TABLE enrollments (
    enrollment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kursus_id UUID NOT NULL REFERENCES kursus(kursus_id) ON DELETE CASCADE,
    talenta_id UUID NOT NULL REFERENCES talenta_profiles(profile_id) ON DELETE CASCADE,
    
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (
        status IN ('ACTIVE', 'COMPLETED', 'DROPPED', 'SUSPENDED')
    ),
    
    -- Progress tracking
    progress DECIMAL(5, 2) DEFAULT 0, -- Percentage
    last_accessed_at TIMESTAMP,
    
    -- Payment
    payment_status VARCHAR(50) DEFAULT 'PENDING' CHECK (
        payment_status IN ('PENDING', 'PAID', 'REFUNDED')
    ),
    payment_id VARCHAR(100),
    
    -- Completion
    completed_at TIMESTAMP,
    certificate_issued BOOLEAN DEFAULT FALSE,
    
    UNIQUE(kursus_id, talenta_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_kursus ON enrollments(kursus_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_talenta ON enrollments(talenta_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);

-- Workshop Table (Flow Chart Node: [28, 35, 47])
CREATE TABLE workshop (
    workshop_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mitra_id UUID NOT NULL REFERENCES mitra_profiles(profile_id) ON DELETE CASCADE,
    kursus_id UUID REFERENCES kursus(kursus_id) ON DELETE SET NULL, -- Optional link to course
    
    -- Workshop information
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- TeFa Location (Flow Chart Node: [35])
    tefa_location_id UUID,
    tefa_location_name VARCHAR(255),
    tefa_address TEXT,
    tefa_city VARCHAR(100),
    tefa_province VARCHAR(100),
    
    -- GPS coordinates for attendance (Flow Chart Node: [47])
    latitude DECIMAL(10, 8), -- -90 to 90
    longitude DECIMAL(11, 8), -- -180 to 180
    geofence_radius DECIMAL(10, 2), -- in meters
    geofence_id UUID,
    
    -- Schedule
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    start_time TIME,
    end_time TIME,
    duration_hours INTEGER,
    
    -- Capacity
    capacity INTEGER NOT NULL,
    enrolled_count INTEGER DEFAULT 0,
    
    -- Pricing
    price DECIMAL(15, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'IDR',
    
    -- Instructor
    instructor_id UUID, -- Reference to user_id
    instructor_name VARCHAR(255),
    
    -- Attendance tracking
    requires_gps_attendance BOOLEAN DEFAULT TRUE,
    attendance_verification_method VARCHAR(50) DEFAULT 'GPS' CHECK (
        attendance_verification_method IN ('GPS', 'QR_CODE', 'NFC', 'BIOMETRIC', 'MANUAL')
    ),
    
    -- Status
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (
        status IN ('DRAFT', 'OPEN', 'FULL', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
    ),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workshop_mitra_id ON workshop(mitra_id);
CREATE INDEX IF NOT EXISTS idx_workshop_kursus_id ON workshop(kursus_id);
CREATE INDEX IF NOT EXISTS idx_workshop_start_date ON workshop(start_date);
CREATE INDEX IF NOT EXISTS idx_workshop_status ON workshop(status);
CREATE INDEX IF NOT EXISTS idx_workshop_location ON workshop USING GIST (
    point(longitude, latitude)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Workshop Sessions (for multi-day workshops)
CREATE TABLE workshop_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID NOT NULL REFERENCES workshop(workshop_id) ON DELETE CASCADE,
    
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    session_number INTEGER,
    
    -- Attendance tracking
    attendance_taken BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workshop_sessions_workshop_id ON workshop_sessions(workshop_id);
CREATE INDEX IF NOT EXISTS idx_workshop_sessions_date ON workshop_sessions(session_date);

-- Workshop Registrations
CREATE TABLE workshop_registrations (
    registration_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workshop_id UUID NOT NULL REFERENCES workshop(workshop_id) ON DELETE CASCADE,
    talenta_id UUID NOT NULL REFERENCES talenta_profiles(profile_id) ON DELETE CASCADE,
    
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')
    ),
    
    -- Payment
    payment_status VARCHAR(50) DEFAULT 'PENDING' CHECK (
        payment_status IN ('PENDING', 'PAID', 'REFUNDED')
    ),
    payment_id VARCHAR(100),
    
    UNIQUE(workshop_id, talenta_id)
);

CREATE INDEX IF NOT EXISTS idx_workshop_registrations_workshop_id ON workshop_registrations(workshop_id);
CREATE INDEX IF NOT EXISTS idx_workshop_registrations_talenta_id ON workshop_registrations(talenta_id);

-- Workshop Attendance (Flow Chart Node: [47])
CREATE TABLE workshop_attendance (
    attendance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL REFERENCES workshop_registrations(registration_id) ON DELETE CASCADE,
    session_id UUID REFERENCES workshop_sessions(session_id) ON DELETE SET NULL,
    
    -- Attendance type
    attendance_type VARCHAR(50) NOT NULL CHECK (
        attendance_type IN ('CHECK_IN', 'CHECK_OUT', 'BREAK_START', 'BREAK_END')
    ),
    
    -- GPS coordinates (Flow Chart Node: [47])
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    accuracy DECIMAL(10, 2), -- in meters
    within_geofence BOOLEAN,
    
    -- Timestamp
    attendance_timestamp TIMESTAMP NOT NULL,
    device_timestamp TIMESTAMP,
    server_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Verification
    verification_method VARCHAR(50),
    verified BOOLEAN DEFAULT FALSE,
    
    -- Device information
    device_id VARCHAR(255),
    ip_address INET,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workshop_attendance_registration_id ON workshop_attendance(registration_id);
CREATE INDEX IF NOT EXISTS idx_workshop_attendance_timestamp ON workshop_attendance(attendance_timestamp);
CREATE INDEX IF NOT EXISTS idx_workshop_attendance_location ON workshop_attendance USING GIST (
    point(longitude, latitude)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- ============================================================================
-- 3. CREDENTIAL LINK: Sertifikat Table
-- Flow Chart Node: [60]
-- ============================================================================

-- Sertifikat (Certificate) Table (Flow Chart Node: [60])
CREATE TABLE sertifikat (
    sertifikat_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Links to Mitra, Talenta, and Kursus
    mitra_id UUID NOT NULL REFERENCES mitra_profiles(profile_id) ON DELETE RESTRICT,
    talenta_id UUID NOT NULL REFERENCES talenta_profiles(profile_id) ON DELETE CASCADE,
    kursus_id UUID REFERENCES kursus(kursus_id) ON DELETE SET NULL,
    workshop_id UUID REFERENCES workshop(workshop_id) ON DELETE SET NULL,
    
    -- Certificate identification
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    credential_id VARCHAR(500) UNIQUE, -- Full IRI for Open Badges
    
    -- Open Badges 3.0 JSON-LD (Flow Chart Node: [60])
    credential_json JSONB NOT NULL, -- Full Open Badges 3.0 credential
    
    -- Certificate details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    issued_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiration_date TIMESTAMP,
    
    -- SKKNI and AQRF alignment
    skkni_code VARCHAR(100),
    skkni_name VARCHAR(255),
    aqrf_level INTEGER CHECK (aqrf_level BETWEEN 1 AND 8),
    
    -- Results
    score DECIMAL(5, 2),
    grade VARCHAR(10),
    level VARCHAR(50),
    
    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (
        status IN ('ACTIVE', 'REVOKED', 'EXPIRED', 'SUSPENDED')
    ),
    revoked_at TIMESTAMP,
    revocation_reason TEXT,
    
    -- Digital signature
    proof_type VARCHAR(100),
    proof_verification_method VARCHAR(500),
    proof_jws TEXT,
    proof_created TIMESTAMP,
    
    -- Blockchain anchoring
    merkle_root_hash VARCHAR(64),
    blockchain_tx_hash VARCHAR(66),
    blockchain_network VARCHAR(50),
    anchored_at TIMESTAMP,
    
    -- Visibility to Industry (Flow Chart Node: [52])
    visible_to_industry BOOLEAN DEFAULT TRUE,
    searchable BOOLEAN DEFAULT TRUE,
    
    -- Tax deduction linkage
    training_cost_id UUID,
    tax_deduction_eligible BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sertifikat_mitra_id ON sertifikat(mitra_id);
CREATE INDEX IF NOT EXISTS idx_sertifikat_talenta_id ON sertifikat(talenta_id);
CREATE INDEX IF NOT EXISTS idx_sertifikat_kursus_id ON sertifikat(kursus_id);
CREATE INDEX IF NOT EXISTS idx_sertifikat_workshop_id ON sertifikat(workshop_id);
CREATE INDEX IF NOT EXISTS idx_sertifikat_status ON sertifikat(status);
CREATE INDEX IF NOT EXISTS idx_sertifikat_skkni_code ON sertifikat(skkni_code);
CREATE INDEX IF NOT EXISTS idx_sertifikat_aqrf_level ON sertifikat(aqrf_level);
CREATE INDEX IF NOT EXISTS idx_sertifikat_visible_industry ON sertifikat(visible_to_industry, searchable);
CREATE INDEX IF NOT EXISTS idx_sertifikat_credential_json ON sertifikat USING GIN (credential_json);

-- ============================================================================
-- 4. INDUSTRY MODULES: Lowongan and Pelamar
-- Flow Chart Nodes: [59, 32]
-- ============================================================================

-- Lowongan (Job Posting) Table (Flow Chart Node: [59])
CREATE TABLE lowongan (
    lowongan_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    industri_id UUID NOT NULL REFERENCES industri_profiles(profile_id) ON DELETE CASCADE,
    
    -- Job information
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    job_type VARCHAR(50) CHECK (
        job_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE')
    ),
    
    -- Location
    location VARCHAR(255),
    city VARCHAR(100),
    province VARCHAR(100),
    remote_allowed BOOLEAN DEFAULT FALSE,
    
    -- Salary
    salary_min DECIMAL(15, 2),
    salary_max DECIMAL(15, 2),
    salary_currency VARCHAR(3) DEFAULT 'IDR',
    salary_period VARCHAR(20) CHECK (salary_period IN ('MONTHLY', 'YEARLY', 'HOURLY')),
    
    -- Requirements (Flow Chart Node: [42])
    requirements JSONB NOT NULL, -- {
    --   skills: string[],
    --   skkniCodes: string[],
    --   aqrfLevel: number,
    --   minExperience: number,
    --   certificates: string[],
    --   education: string[]
    -- }
    
    -- Positions
    positions_available INTEGER DEFAULT 1,
    positions_filled INTEGER DEFAULT 0,
    
    -- Application
    application_deadline TIMESTAMP,
    application_count INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (
        status IN ('DRAFT', 'PUBLISHED', 'CLOSED', 'FILLED', 'CANCELLED')
    ),
    
    -- Visibility to Talenta (Flow Chart Node: [59])
    visible_to_talenta BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lowongan_industri_id ON lowongan(industri_id);
CREATE INDEX IF NOT EXISTS idx_lowongan_status ON lowongan(status);
CREATE INDEX IF NOT EXISTS idx_lowongan_visible_talenta ON lowongan(visible_to_talenta, status);
CREATE INDEX IF NOT EXISTS idx_lowongan_requirements ON lowongan USING GIN (requirements);
CREATE INDEX IF NOT EXISTS idx_lowongan_location ON lowongan(city, province);

-- Pelamar (Job Applicant) Table (Flow Chart Node: [32])
CREATE TABLE pelamar (
    pelamar_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lowongan_id UUID NOT NULL REFERENCES lowongan(lowongan_id) ON DELETE CASCADE,
    talenta_id UUID NOT NULL REFERENCES talenta_profiles(profile_id) ON DELETE CASCADE,
    
    -- Application information
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (
        status IN (
            'PENDING', 'REVIEWING', 'SHORTLISTED', 
            'INTERVIEW_SCHEDULED', 'HIRED', 'REJECTED'
        )
    ),
    
    -- Application documents
    cover_letter TEXT,
    resume_url VARCHAR(500),
    
    -- Attached certificates (Flow Chart Node: [61])
    attached_certificates UUID[], -- Array of sertifikat_id
    
    -- Review information
    reviewed_at TIMESTAMP,
    reviewed_by UUID, -- industri user_id
    review_notes TEXT,
    
    -- Interview (Flow Chart Node: [49])
    interview_scheduled BOOLEAN DEFAULT FALSE,
    interview_date TIMESTAMP,
    interview_location VARCHAR(255),
    interview_type VARCHAR(50) CHECK (
        interview_type IN ('ONLINE', 'ONSITE', 'PHONE', 'VIDEO')
    ),
    
    -- Hiring decision (Flow Chart Node: [53])
    hiring_decision VARCHAR(50) CHECK (hiring_decision IN ('ACCEPT', 'REJECT', 'PENDING')),
    hiring_decision_at TIMESTAMP,
    hiring_decision_by UUID, -- industri user_id
    hiring_decision_notes TEXT,
    
    -- Talent pool (Flow Chart Node: [58])
    saved_to_talent_pool BOOLEAN DEFAULT FALSE,
    talent_pool_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(lowongan_id, talenta_id)
);

CREATE INDEX IF NOT EXISTS idx_pelamar_lowongan_id ON pelamar(lowongan_id);
CREATE INDEX IF NOT EXISTS idx_pelamar_talenta_id ON pelamar(talenta_id);
CREATE INDEX IF NOT EXISTS idx_pelamar_status ON pelamar(status);
CREATE INDEX IF NOT EXISTS idx_pelamar_applied_at ON pelamar(applied_at);
CREATE INDEX IF NOT EXISTS idx_pelamar_hiring_decision ON pelamar(hiring_decision);

-- Talent Pool Table (Flow Chart Node: [58])
CREATE TABLE talent_pool (
    talent_pool_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    industri_id UUID NOT NULL REFERENCES industri_profiles(profile_id) ON DELETE CASCADE,
    talenta_id UUID NOT NULL REFERENCES talenta_profiles(profile_id) ON DELETE CASCADE,
    
    -- Source information
    source_type VARCHAR(50) CHECK (source_type IN ('REJECTED_APPLICATION', 'SEARCH', 'MANUAL')),
    source_application_id UUID REFERENCES pelamar(pelamar_id) ON DELETE SET NULL,
    source_job_id UUID REFERENCES lowongan(lowongan_id) ON DELETE SET NULL,
    
    -- Reason for saving
    reason TEXT,
    notes TEXT,
    tags TEXT[], -- Array of tags for categorization
    
    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (
        status IN ('ACTIVE', 'CONTACTED', 'HIRED', 'REMOVED')
    ),
    
    -- Contact history
    last_contacted_at TIMESTAMP,
    contact_count INTEGER DEFAULT 0,
    
    -- Timestamps
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(industri_id, talenta_id)
);

CREATE INDEX IF NOT EXISTS idx_talent_pool_industri_id ON talent_pool(industri_id);
CREATE INDEX IF NOT EXISTS idx_talent_pool_talenta_id ON talent_pool(talenta_id);
CREATE INDEX IF NOT EXISTS idx_talent_pool_status ON talent_pool(status);
CREATE INDEX IF NOT EXISTS idx_talent_pool_tags ON talent_pool USING GIN (tags);

-- ============================================================================
-- 5. TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_talenta_profiles_updated_at BEFORE UPDATE ON talenta_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mitra_profiles_updated_at BEFORE UPDATE ON mitra_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_industri_profiles_updated_at BEFORE UPDATE ON industri_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kursus_updated_at BEFORE UPDATE ON kursus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workshop_updated_at BEFORE UPDATE ON workshop
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sertifikat_updated_at BEFORE UPDATE ON sertifikat
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lowongan_updated_at BEFORE UPDATE ON lowongan
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pelamar_updated_at BEFORE UPDATE ON pelamar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle hiring decision and move to talent pool (Flow Chart Node: [53, 58])
CREATE OR REPLACE FUNCTION handle_hiring_decision()
RETURNS TRIGGER AS $$
BEGIN
    -- If decision is REJECT and should save to talent pool
    IF NEW.hiring_decision = 'REJECT' AND NEW.saved_to_talent_pool = TRUE THEN
        -- Check if already in talent pool
        IF NOT EXISTS (
            SELECT 1 FROM talent_pool 
            WHERE industri_id = (SELECT industri_id FROM lowongan WHERE lowongan_id = NEW.lowongan_id)
            AND talenta_id = NEW.talenta_id
        ) THEN
            -- Insert into talent pool (Flow Chart Node: [58])
            INSERT INTO talent_pool (
                industri_id,
                talenta_id,
                source_type,
                source_application_id,
                source_job_id,
                reason,
                notes,
                status
            ) VALUES (
                (SELECT industri_id FROM lowongan WHERE lowongan_id = NEW.lowongan_id),
                NEW.talenta_id,
                'REJECTED_APPLICATION',
                NEW.pelamar_id,
                NEW.lowongan_id,
                NEW.talent_pool_reason,
                NEW.hiring_decision_notes,
                'ACTIVE'
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for hiring decision (Flow Chart Node: [53])
CREATE TRIGGER trigger_hiring_decision
    AFTER UPDATE OF hiring_decision ON pelamar
    FOR EACH ROW
    WHEN (NEW.hiring_decision IS NOT NULL)
    EXECUTE FUNCTION handle_hiring_decision();

-- Function to update workshop enrolled count
CREATE OR REPLACE FUNCTION update_workshop_enrolled_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE workshop 
        SET enrolled_count = enrolled_count + 1
        WHERE workshop_id = NEW.workshop_id;
        
        -- Check if workshop is full
        UPDATE workshop
        SET status = 'FULL'
        WHERE workshop_id = NEW.workshop_id
        AND enrolled_count >= capacity;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE workshop 
        SET enrolled_count = enrolled_count - 1
        WHERE workshop_id = OLD.workshop_id;
        
        -- Reopen if not full
        UPDATE workshop
        SET status = 'OPEN'
        WHERE workshop_id = OLD.workshop_id
        AND enrolled_count < capacity
        AND status = 'FULL';
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_workshop_enrolled_count
    AFTER INSERT OR DELETE ON workshop_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_workshop_enrolled_count();

-- Function to update lowongan application count
CREATE OR REPLACE FUNCTION update_lowongan_application_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE lowongan 
        SET application_count = application_count + 1
        WHERE lowongan_id = NEW.lowongan_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE lowongan 
        SET application_count = application_count - 1
        WHERE lowongan_id = OLD.lowongan_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_lowongan_application_count
    AFTER INSERT OR DELETE ON pelamar
    FOR EACH ROW
    EXECUTE FUNCTION update_lowongan_application_count();

-- ============================================================================
-- 6. VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Talenta with certificates
CREATE OR REPLACE VIEW talenta_with_certificates AS
SELECT 
    tp.*,
    u.email,
    u.full_name,
    u.status as user_status,
    COUNT(s.sertifikat_id) as certificate_count,
    MAX(s.issued_date) as latest_certificate_date
FROM talenta_profiles tp
JOIN users u ON tp.user_id = u.user_id
LEFT JOIN sertifikat s ON tp.profile_id = s.talenta_id AND s.status = 'ACTIVE'
GROUP BY tp.profile_id, u.email, u.full_name, u.status;

-- View: Lowongan with application stats
CREATE OR REPLACE VIEW lowongan_with_stats AS
SELECT 
    l.*,
    ip.company_name,
    COUNT(p.pelamar_id) as total_applications,
    COUNT(CASE WHEN p.status = 'PENDING' THEN 1 END) as pending_applications,
    COUNT(CASE WHEN p.status = 'SHORTLISTED' THEN 1 END) as shortlisted_applications,
    COUNT(CASE WHEN p.hiring_decision = 'ACCEPT' THEN 1 END) as accepted_applications
FROM lowongan l
JOIN industri_profiles ip ON l.industri_id = ip.profile_id
LEFT JOIN pelamar p ON l.lowongan_id = p.lowongan_id
GROUP BY l.lowongan_id, ip.company_name;

-- View: Workshop with enrollment stats
CREATE OR REPLACE VIEW workshop_with_stats AS
SELECT 
    w.*,
    mp.organization_name,
    COUNT(wr.registration_id) as total_registrations,
    COUNT(CASE WHEN wr.status = 'CONFIRMED' THEN 1 END) as confirmed_registrations,
    COUNT(CASE WHEN wr.status = 'COMPLETED' THEN 1 END) as completed_registrations
FROM workshop w
JOIN mitra_profiles mp ON w.mitra_id = mp.profile_id
LEFT JOIN workshop_registrations wr ON w.workshop_id = wr.workshop_id
GROUP BY w.workshop_id, mp.organization_name;

-- ============================================================================
-- 7. LEARNING RECORD STORE (LRS) SCHEMA
-- ============================================================================

-- Create LRS schema if not exists
CREATE SCHEMA IF NOT EXISTS lrs;

-- Core xAPI statements table
CREATE TABLE IF NOT EXISTS lrs.statements (
    statement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- xAPI Statement ID (unique identifier)
    xapi_statement_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- Actor (who performed the action)
    actor_type VARCHAR(50) NOT NULL CHECK (actor_type IN ('Agent', 'Group')),
    actor_account_name VARCHAR(255),
    actor_account_homepage VARCHAR(500),
    actor_mbox VARCHAR(255), -- mailto:email@example.com
    actor_mbox_sha1sum VARCHAR(40),
    actor_openid VARCHAR(500),
    actor_name VARCHAR(255),
    actor_object_type VARCHAR(50) DEFAULT 'Agent',
    actor_json JSONB NOT NULL, -- Full actor object
    
    -- Verb (the action)
    verb_id VARCHAR(500) NOT NULL, -- IRI of the verb
    verb_display JSONB NOT NULL, -- Language map: {"en-US": "completed"}
    verb_json JSONB NOT NULL, -- Full verb object
    
    -- Object (what the action was performed on)
    object_type VARCHAR(50) NOT NULL, -- Activity, Agent, Group, StatementRef, SubStatement
    object_id VARCHAR(500), -- IRI if Activity
    object_definition_name JSONB, -- Language map
    object_definition_description JSONB, -- Language map
    object_definition_type VARCHAR(500), -- Activity type IRI
    object_definition_more_info VARCHAR(500),
    object_json JSONB NOT NULL, -- Full object
    
    -- Result (outcome of the action)
    result_success BOOLEAN,
    result_completion BOOLEAN,
    result_duration VARCHAR(50), -- ISO 8601 duration
    result_score_scaled DECIMAL(5,4), -- 0.0 to 1.0
    result_score_raw DECIMAL(10,2),
    result_score_min DECIMAL(10,2),
    result_score_max DECIMAL(10,2),
    result_response TEXT,
    result_extensions JSONB,
    result_json JSONB, -- Full result object
    
    -- Context (environmental context)
    context_registration UUID, -- Registration ID for grouping statements
    context_instructor JSONB, -- Instructor agent
    context_team JSONB, -- Team group
    context_revision VARCHAR(255), -- Activity revision
    context_platform VARCHAR(255), -- Platform identifier
    context_language VARCHAR(10), -- Language code
    context_statement JSONB, -- Referenced statement
    context_context_activities JSONB, -- Grouping, category, other
    context_extensions JSONB, -- Custom context data
    context_json JSONB, -- Full context object
    
    -- Authority (who verified the statement)
    authority_object_type VARCHAR(50) DEFAULT 'Agent',
    authority_mbox VARCHAR(255),
    authority_name VARCHAR(255),
    authority_json JSONB, -- Full authority object
    
    -- Timestamps
    timestamp TIMESTAMP NOT NULL, -- When the action occurred
    stored TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When stored in LRS
    version VARCHAR(20) DEFAULT '1.0.0',
    
    -- Attachments (for evidence files)
    attachments JSONB, -- Array of attachment objects
    
    -- Full statement JSON (for complete xAPI compliance)
    statement_json JSONB NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for LRS statements
CREATE INDEX IF NOT EXISTS idx_statements_actor ON lrs.statements USING GIN (actor_json);
CREATE INDEX IF NOT EXISTS idx_statements_verb ON lrs.statements(verb_id);
CREATE INDEX IF NOT EXISTS idx_statements_object ON lrs.statements(object_id, object_type);
CREATE INDEX IF NOT EXISTS idx_statements_timestamp ON lrs.statements(timestamp);
CREATE INDEX IF NOT EXISTS idx_statements_stored ON lrs.statements(stored);
CREATE INDEX IF NOT EXISTS idx_statements_registration ON lrs.statements(context_registration);
CREATE INDEX IF NOT EXISTS idx_statements_json ON lrs.statements USING GIN (statement_json);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

