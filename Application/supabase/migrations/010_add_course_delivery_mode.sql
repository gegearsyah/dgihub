-- Migration: Add delivery_mode to kursus table
-- This adds support for offline, online, and hybrid course delivery modes

DO $$
BEGIN
    -- Add delivery_mode column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'kursus' 
        AND column_name = 'delivery_mode'
    ) THEN
        ALTER TABLE public.kursus 
        ADD COLUMN delivery_mode VARCHAR(20) DEFAULT 'ONLINE' CHECK (
            delivery_mode IN ('ONLINE', 'OFFLINE', 'HYBRID')
        );
        
        CREATE INDEX IF NOT EXISTS idx_kursus_delivery_mode ON public.kursus(delivery_mode);
        
        RAISE NOTICE 'Added delivery_mode column to kursus table';
    ELSE
        RAISE NOTICE 'delivery_mode column already exists in kursus table';
    END IF;
END $$;
