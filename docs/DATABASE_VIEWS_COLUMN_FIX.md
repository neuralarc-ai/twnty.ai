# Fix Missing Views Column

## Issue

The `twnty_articles` table is missing the `views` column, causing the cron job to fail with error:
```
column twnty_articles.views does not exist
```

## Quick Fix

Run this SQL in your **Supabase SQL Editor**:

```sql
-- Add views column to twnty_articles table
ALTER TABLE twnty_articles 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Update existing rows
UPDATE twnty_articles SET views = 0 WHERE views IS NULL;
```

## Alternative: Use the SQL File

1. Open `fix_views_column.sql` in this project
2. Copy the contents
3. Paste into Supabase SQL Editor
4. Click "Run"

## After Running the Fix

1. The cron job will work properly
2. Articles will track view counts
3. The engagement boost will update both likes and views

## Code Protection

The code has been updated to handle missing views column gracefully, but you should still add the column for full functionality!

