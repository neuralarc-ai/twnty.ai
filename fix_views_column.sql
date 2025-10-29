-- Fix missing views column in twnty_articles table
-- Run this in your Supabase SQL Editor

-- Add views column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'twnty_articles' 
        AND column_name = 'views'
    ) THEN
        ALTER TABLE twnty_articles ADD COLUMN views INTEGER DEFAULT 0;
    END IF;
END $$;

-- Update any existing rows to have 0 views if null
UPDATE twnty_articles SET views = 0 WHERE views IS NULL;

