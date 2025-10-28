-- Fix twnty_likes table schema
-- Run this in your Supabase SQL Editor

-- Check if the table exists and has the correct structure
-- If the table exists but is missing the user_ip column, add it
DO $$ 
BEGIN
    -- Check if column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'twnty_likes' 
        AND column_name = 'user_ip'
    ) THEN
        -- Add the user_ip column
        ALTER TABLE twnty_likes ADD COLUMN user_ip TEXT NOT NULL DEFAULT 'unknown';
        
        -- Add unique constraint
        ALTER TABLE twnty_likes ADD CONSTRAINT twnty_likes_article_ip_unique 
        UNIQUE(article_id, user_ip);
    END IF;
END $$;
