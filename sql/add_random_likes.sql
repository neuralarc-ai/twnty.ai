-- Add Random Likes (5-10) to All Articles
-- Run this in your Supabase SQL Editor

-- Add random likes between 5-10 to all articles
UPDATE twnty_articles 
SET likes = FLOOR(RANDOM() * 6) + 5  -- Random number between 5-10 (5 + 0-5)
WHERE likes IS NOT NULL;

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

-- Check summary statistics
SELECT 
    COUNT(*) as total_articles,
    MIN(likes) as min_likes,
    MAX(likes) as max_likes,
    AVG(likes)::INTEGER as avg_likes
FROM twnty_articles
WHERE likes IS NOT NULL;

