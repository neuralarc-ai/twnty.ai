-- Fix missing views and likes columns in twnty_articles table
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
        RAISE NOTICE 'Added views column';
    ELSE
        RAISE NOTICE 'Views column already exists';
    END IF;
END $$;

-- Add likes column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'twnty_articles' 
        AND column_name = 'likes'
    ) THEN
        ALTER TABLE twnty_articles ADD COLUMN likes INTEGER DEFAULT 0;
        RAISE NOTICE 'Added likes column';
    ELSE
        RAISE NOTICE 'Likes column already exists';
    END IF;
END $$;

-- Update any existing rows to have 0 views and likes if null
UPDATE twnty_articles SET views = 0 WHERE views IS NULL;
UPDATE twnty_articles SET likes = 0 WHERE likes IS NULL;

