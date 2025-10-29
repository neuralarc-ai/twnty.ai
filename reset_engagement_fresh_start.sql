-- Reset Engagement Data for Fresh Start
-- Run this in your Supabase SQL Editor

-- Reset all likes to 0
UPDATE twnty_articles 
SET likes = 0 
WHERE likes IS NOT NULL;

-- Set views to random value between 30-40 for all articles
UPDATE twnty_articles 
SET views = FLOOR(RANDOM() * 11) + 30  -- Random number between 30-40
WHERE views IS NOT NULL;

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

