# 🔄 Fresh Start - Reset Engagement Data

## What This Does

This will reset your engagement data to start fresh with the new proportional system:

1. **Reset all likes to 0** across all articles
2. **Set all views to 30-40** (random value in this range)
3. **Start fresh** with the new hourly engagement boost system

## ⚠️ Important Notes

- **This action is irreversible** - all current likes will be reset to 0
- **Views will be randomized** to 30-40 for each article
- **Comments will NOT be deleted** - they will remain
- **The new system** will start adding engagement hourly from this baseline

## 🚀 Steps to Execute

### Step 1: Run the SQL Script

1. Go to your **Supabase Dashboard**
2. Click **SQL Editor**
3. Click **New query**
4. Open `reset_engagement_fresh_start.sql`
5. Copy the entire contents
6. Paste into SQL Editor
7. Click **Run** or press `Ctrl/Cmd + Enter`

### Step 2: Verify the Reset

After running, check the results:
- All articles should show `likes = 0`
- All articles should show `views` between 30-40
- Comments should remain unchanged

### Step 3: Start Hourly Cron

Once reset, set up hourly external cron (see `EXTERNAL_CRON_HOURLY_SETUP.md`):
- Engagement will start adding gradually
- Views will scale with likes (3-4x ratio)
- Everything will be distributed throughout the day

## 📊 What to Expect After Reset

### Initial State:
- **Likes:** 0 (all articles)
- **Views:** 30-40 (random per article)
- **Comments:** Unchanged

### After 24 Hours (with hourly cron):
- **Likes:** ~19 per article
- **Views:** ~30-40 (initial) + ~70 (new) = ~100-110 total
- **Comments:** ~12 per article

## 💡 Alternative: Manual Reset for Specific Articles

If you only want to reset specific articles:

```sql
-- Reset specific article by ID
UPDATE twnty_articles 
SET likes = 0, views = FLOOR(RANDOM() * 11) + 30
WHERE id = 'your-article-id-here';

-- Reset only published articles
UPDATE twnty_articles 
SET likes = 0, views = FLOOR(RANDOM() * 11) + 30
WHERE status = 'published';
```

## ✅ After Running

1. **Check your articles** - verify likes are 0 and views are 30-40
2. **Set up hourly cron** - Use external service for natural distribution
3. **Monitor engagement** - Watch it grow gradually throughout the day

