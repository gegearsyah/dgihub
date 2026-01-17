-- Migration: Add payment fields to enrollments table
-- This enables tracking payment information for course enrollments

DO $$
BEGIN
    -- Add payment_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'enrollments' 
        AND column_name = 'payment_id'
    ) THEN
        ALTER TABLE public.enrollments 
        ADD COLUMN payment_id VARCHAR(100);
        RAISE NOTICE 'Added payment_id column to enrollments';
    END IF;

    -- Add payment_status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'enrollments' 
        AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE public.enrollments 
        ADD COLUMN payment_status VARCHAR(50) DEFAULT 'FREE' CHECK (
            payment_status IN ('FREE', 'PENDING', 'PAID', 'FAILED', 'REFUNDED')
        );
        RAISE NOTICE 'Added payment_status column to enrollments';
    END IF;

    -- Add payment_method column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'enrollments' 
        AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE public.enrollments 
        ADD COLUMN payment_method VARCHAR(50);
        RAISE NOTICE 'Added payment_method column to enrollments';
    END IF;

    -- Add payment_amount column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'enrollments' 
        AND column_name = 'payment_amount'
    ) THEN
        ALTER TABLE public.enrollments 
        ADD COLUMN payment_amount DECIMAL(10, 2) DEFAULT 0;
        RAISE NOTICE 'Added payment_amount column to enrollments';
    END IF;

    -- Add paid_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'enrollments' 
        AND column_name = 'paid_at'
    ) THEN
        ALTER TABLE public.enrollments 
        ADD COLUMN paid_at TIMESTAMPTZ;
        RAISE NOTICE 'Added paid_at column to enrollments';
    END IF;

    -- Create index on payment_id for faster lookups
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'enrollments' 
        AND indexname = 'idx_enrollments_payment_id'
    ) THEN
        CREATE INDEX idx_enrollments_payment_id ON public.enrollments(payment_id);
        RAISE NOTICE 'Created index on payment_id';
    END IF;

    -- Create index on payment_status for filtering
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'enrollments' 
        AND indexname = 'idx_enrollments_payment_status'
    ) THEN
        CREATE INDEX idx_enrollments_payment_status ON public.enrollments(payment_status);
        RAISE NOTICE 'Created index on payment_status';
    END IF;
END $$;
