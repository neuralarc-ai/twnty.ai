# 🔄 External Cron Setup for Hourly Engagement Boost

## Why External Cron?

Since Vercel Free Tier only allows **daily** cron jobs, but you want engagement spread **throughout the day**, we'll use an external cron service that runs **hourly**.

## 📊 New Engagement Pattern (Hourly)

With hourly execution, each article will receive:

### Per Article Per Hour:
- **Likes:** 1 like (80% chance) = ~0.8 likes/hour
- **Comments:** 1 comment (50% chance) = ~0.5 comments/hour  
- **Views:** 1 view (60% chance) = ~0.6 views/hour

### Per Article Per Day (24 hourly runs):
- **Likes:** ~19 likes/day (20-30 range over 24 hours)
- **Comments:** ~12 comments/day (10-15 range over 24 hours)
- **Views:** ~14 views/day (spread naturally)

## 🚀 Setup Instructions

### Option 1: cron-job.org (Recommended - Free)

1. **Sign up** at https://cron-job.org (free account)

2. **Create New Cron Job:**
   - Click "Create cronjob"
   - **Title:** `twnty-blog-hourly-engagement`
   - **Address (URL):** `https://your-domain.vercel.app/api/cron/boost-engagement`
   - **Schedule:** Every hour
     - Select "Every hour" from dropdown, OR
     - Use cron expression: `0 * * * *`
   - **Request Method:** `GET`
   - **Request Header:**
     - **Name:** `Authorization`
     - **Value:** `Bearer YOUR_CRON_SECRET`
   - **Activate:** ✅ Check the box
   - Click "Create cronjob"

3. **Set CRON_SECRET in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `CRON_SECRET` = Your secure random string
   - Apply to: Production, Preview, Development

4. **Test Immediately:**
   - After creating, click "Run now" to test
   - Check the response should be `200 OK`

### Option 2: EasyCron (Free Tier)

1. Sign up at https://www.easycron.com
2. Create cron job with same settings as above

### Option 3: GitHub Actions (If using GitHub)

See `GITHUB_ACTIONS_CRON_SETUP.md` for hourly GitHub Actions workflow.

## ⚙️ Important: Remove Vercel Cron

Since you'll be using external hourly cron, you should either:

1. **Remove vercel.json** (recommended):
   ```bash
   git rm vercel.json
   git commit -m "Remove vercel.json - using external hourly cron"
   git push
   ```

2. **OR keep it disabled** - Vercel cron won't interfere, but external cron is the active one

## ✅ Verification

After setup, verify:

1. ✅ External cron service shows successful runs hourly
2. ✅ Check Vercel function logs - should see executions hourly
3. ✅ Articles show gradual engagement increase throughout the day
4. ✅ Not all likes/comments appear at once

## 📊 Expected Results

### Hour 1 (midnight UTC):
- 1-2 likes added across articles
- 0-1 comments added
- 1-2 views added

### Hour 2:
- More engagement added...
- Continues throughout 24 hours

### After 24 Hours:
- **Total per article:** ~19 likes, ~12 comments, ~14 views
- **Spread naturally** throughout the day, not all at once! ✅

## 🔧 Adjusting Engagement Rates

Edit `app/api/cron/boost-engagement/route.ts`:

```typescript
// Line ~226: Likes per hour probability (currently 80%)
const shouldAddLike = Math.random() > 0.2; // 0.2 = 80% chance
// Change to 0.3 for 70% chance, 0.1 for 90% chance

// Line ~231: Comments per hour probability (currently 50%)
const shouldAddComment = Math.random() > 0.5; // 0.5 = 50% chance
// Change to 0.4 for 60% chance, 0.6 for 40% chance

// Line ~236: Views per hour probability (currently 60%)
const shouldAddView = Math.random() > 0.4; // 0.4 = 60% chance
```

## ⚠️ Note on Vercel Limits

- **Daily cron:** Still configured (runs at midnight UTC)
- **External hourly cron:** Main source of engagement (runs every hour)
- Both will work simultaneously, but external cron provides the hourly distribution

If you want ONLY hourly (no daily boost), remove `vercel.json` as mentioned above.

