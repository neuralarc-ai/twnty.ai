-- Add Random Comments (1-3) to All Articles
-- Run this in your Supabase SQL Editor

-- Generate random comments for all articles
DO $$
DECLARE
    article_record RECORD;
    comment_count INTEGER;
    i INTEGER;
    random_name TEXT;
    random_email TEXT;
    random_comment TEXT;
    name_list TEXT[] := ARRAY[
        'Alex Johnson', 'Sarah Chen', 'Michael Brown', 'Emily Davis', 'David Wilson',
        'Jessica Martinez', 'James Anderson', 'Amanda Taylor', 'Robert Thomas', 'Lisa Jackson',
        'John White', 'Maria Garcia', 'Daniel Lee', 'Jennifer Harris', 'Christopher Martin',
        'Ashley Young', 'Matthew King', 'Nicole Wright', 'Andrew Lopez', 'Kimberly Hill'
    ];
    email_domains TEXT[] := ARRAY['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
    comment_templates TEXT[] := ARRAY[
        'Great insights! This really helped me understand the topic better.',
        'Excellent article! I''ve been looking for information like this.',
        'Very well written and informative. Thank you for sharing!',
        'This is exactly what I needed. Keep up the good work!',
        'Interesting perspective. I''ll definitely be following your content.',
        'Well researched and presented. Looking forward to more articles.',
        'Thanks for breaking this down in such a clear way.',
        'This resonates with me. Great read!',
        'Really appreciate the effort put into this article.',
        'Excellent points made here. Very insightful!',
        'I learned something new today. Thank you!',
        'This is valuable information. Bookmarking this one!',
        'Well done! This was a great read from start to finish.',
        'Appreciate you sharing your knowledge on this topic.',
        'Good breakdown of the concepts. Easy to understand.'
    ];
BEGIN
    -- Loop through all articles
    FOR article_record IN 
        SELECT id FROM twnty_articles
    LOOP
        -- Generate random number of comments (1-3) for this article
        comment_count := FLOOR(RANDOM() * 3) + 1; -- 1-3 comments
        
        -- Add comments
        FOR i IN 1..comment_count LOOP
            -- Pick random name
            random_name := name_list[FLOOR(RANDOM() * array_length(name_list, 1)) + 1];
            
            -- Generate email from name
            random_email := LOWER(REPLACE(random_name, ' ', '.')) || 
                           FLOOR(RANDOM() * 100)::TEXT || 
                           '@' || email_domains[FLOOR(RANDOM() * array_length(email_domains, 1)) + 1];
            
            -- Pick random comment
            random_comment := comment_templates[FLOOR(RANDOM() * array_length(comment_templates, 1)) + 1];
            
            -- Insert comment
            INSERT INTO twnty_comments (article_id, author_name, author_email, content)
            VALUES (article_record.id, random_name, random_email, random_comment)
            ON CONFLICT DO NOTHING; -- Skip if there's any conflict
            
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Comments added to all articles';
END $$;

-- Verify the changes
SELECT 
    a.id,
    a.title,
    COUNT(c.id) as comment_count,
    a.status
FROM twnty_articles a
LEFT JOIN twnty_comments c ON c.article_id = a.id
GROUP BY a.id, a.title, a.status
ORDER BY a.created_at DESC
LIMIT 10;

-- Check summary statistics
SELECT 
    COUNT(DISTINCT a.id) as total_articles,
    COUNT(c.id) as total_comments,
    MIN(comment_counts.count) as min_comments,
    MAX(comment_counts.count) as max_comments,
    AVG(comment_counts.count)::INTEGER as avg_comments_per_article
FROM twnty_articles a
LEFT JOIN twnty_comments c ON c.article_id = a.id
LEFT JOIN LATERAL (
    SELECT COUNT(*) as count 
    FROM twnty_comments 
    WHERE article_id = a.id
) comment_counts ON true
GROUP BY a.id;

