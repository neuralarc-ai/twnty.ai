-- Reset Engagement Data for Fresh Start
-- Run this in your Supabase SQL Editor

-- Reset all likes to 0
UPDATE twnty_articles 
SET likes = 0 
WHERE likes IS NOT NULL;

-- Set views to random value between 30-40 for all articles
-- Note: If views column doesn't exist, run fix_missing_columns.sql first
UPDATE twnty_articles 
SET views = FLOOR(RANDOM() * 11) + 30  -- Random number between 30-40
WHERE views IS NOT NULL;

-- If views column doesn't exist, this will fail - run fix_missing_columns.sql first
-- Or use this safer version that handles missing column:
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'twnty_articles' AND column_name = 'views'
    ) THEN
        UPDATE twnty_articles SET views = FLOOR(RANDOM() * 11) + 30 WHERE views IS NOT NULL;
    END IF;
END $$;

-- Verify the changes
SELECT 
    id, 
    title, 
    likes, 
    views,
    status
FROM twnty_articles
ORDER BY created_at DESC
LIMIT 10;

