-- Migration: Add progress tracking to material_completions
-- This enables tracking video watch progress, document reading progress, etc.

DO $$
BEGIN
    -- Add progress_percentage column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'material_completions' 
        AND column_name = 'progress_percentage'
    ) THEN
        ALTER TABLE public.material_completions 
        ADD COLUMN progress_percentage DECIMAL(5, 2) DEFAULT 0 CHECK (
            progress_percentage >= 0 AND progress_percentage <= 100
        );
        RAISE NOTICE 'Added progress_percentage column to material_completions';
    END IF;

    -- Add last_position column for video/document position tracking
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'material_completions' 
        AND column_name = 'last_position'
    ) THEN
        ALTER TABLE public.material_completions 
        ADD COLUMN last_position INTEGER DEFAULT 0;
        RAISE NOTICE 'Added last_position column to material_completions';
    END IF;

    -- Add time_spent_seconds column for tracking learning time
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'material_completions' 
        AND column_name = 'time_spent_seconds'
    ) THEN
        ALTER TABLE public.material_completions 
        ADD COLUMN time_spent_seconds INTEGER DEFAULT 0;
        RAISE NOTICE 'Added time_spent_seconds column to material_completions';
    END IF;

    -- Add updated_at column for tracking last progress update
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'material_completions' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.material_completions 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added updated_at column to material_completions';
    END IF;
END $$;

-- Create index for faster progress queries
CREATE INDEX IF NOT EXISTS idx_completions_progress ON public.material_completions(talenta_id, progress_percentage);
