-- Add price column to workshops table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'workshops' 
        AND column_name = 'price'
    ) THEN
        ALTER TABLE public.workshops 
        ADD COLUMN price DECIMAL(15, 2) DEFAULT 0;
        
        RAISE NOTICE 'Added price column to workshops table';
    ELSE
        RAISE NOTICE 'Price column already exists in workshops table';
    END IF;
END $$;
