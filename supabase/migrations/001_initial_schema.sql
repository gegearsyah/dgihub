-- DGIHub Platform - Initial Database Schema for Supabase
-- This migration sets up the core tables for the platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('TALENTA', 'MITRA', 'INDUSTRI')),
  nik TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mitra_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  duration_hours INTEGER,
  skkni_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  talenta_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'ENROLLED' CHECK (status IN ('ENROLLED', 'COMPLETED', 'DROPPED')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(talenta_id, course_id)
);

-- Certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  talenta_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  mitra_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL,
  issued_date TIMESTAMPTZ DEFAULT NOW(),
  credential_url TEXT,
  aqrf_level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job postings table
CREATE TABLE IF NOT EXISTS public.job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  industri_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  city TEXT,
  province TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'CLOSED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job applications table
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE,
  talenta_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  UNIQUE(job_id, talenta_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Anyone can read published courses
CREATE POLICY "Anyone can read published courses" ON public.courses
  FOR SELECT USING (true);

-- Mitra can manage their own courses
CREATE POLICY "Mitra can manage own courses" ON public.courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = courses.mitra_id
      AND users.id = auth.uid()
      AND users.user_type = 'MITRA'
    )
  );

-- Talenta can read their own enrollments
CREATE POLICY "Talenta can read own enrollments" ON public.enrollments
  FOR SELECT USING (auth.uid() = talenta_id);

-- Talenta can read their own certificates
CREATE POLICY "Talenta can read own certificates" ON public.certificates
  FOR SELECT USING (auth.uid() = talenta_id);

-- Anyone can read published job postings
CREATE POLICY "Anyone can read published jobs" ON public.job_postings
  FOR SELECT USING (status = 'PUBLISHED');

-- Talenta can read their own applications
CREATE POLICY "Talenta can read own applications" ON public.job_applications
  FOR SELECT USING (auth.uid() = talenta_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_mitra ON public.courses(mitra_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_talenta ON public.enrollments(talenta_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_talenta ON public.certificates(talenta_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_industri ON public.job_postings(industri_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_talenta ON public.job_applications(talenta_id);

