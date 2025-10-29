# 📊 Engagement Boost - Current Implementation Details

## ⏰ Schedule

**Current:** Using **Vercel Cron Jobs** (daily execution)
- **Schedule:** `0 0 * * *` (daily at 12:00 AM UTC)
- **Frequency:** 1 execution per day
- **Note:** Vercel Free Tier only supports daily cron (hourly requires Pro plan)
- **Distribution:** Since it's daily, engagement is added once per day (not spread hourly)

## 📈 Per Article Per Day

For each published article, the cron job adds:

### 1. **Likes**
- **Amount:** 20-30 likes per article per day
- **Added:** Once daily when cron runs (random 20-30)
- **Expected per day:** ~25 likes per article (average)
- **Distribution:** Added all at once daily (midnight UTC) ⏰

### 2. **Comments**
- **Amount:** 10-15 comments per article per day
- **Added:** Once daily when cron runs (random 10-15)
- **Expected per day:** ~12.5 comments per article (average)
- **Distribution:** Added all at once daily (midnight UTC) ⏰
- **Comments are realistic:** Uses 15 different templates with random names and emails

### 3. **Views**
- **Amount:** 3-4 views per like (proportional to likes)
- **Ratio:** 2.5x to 4x of likes (rounded to 3-4 views per like)
- **Expected per day:** ~75-120 views per article (proportional to 20-30 likes)
- **Distribution:** Scales with likes - added daily when cron runs 📈

## 📊 Example: Daily Totals

If you have **5 published articles**:

- **Likes:** 5 × 19 = **~95 likes per day** (80-100 range, spread throughout)
- **Comments:** 5 × 12 = **~60 comments per day** (50-75 range, spread throughout)
- **Views:** 5 × 70 = **~350 views per day** (proportional to likes, 2.5-4x ratio)
  - *Views = Likes × 3.5 (average of 3-4x range)*

## 📅 Monthly Projections

For 5 published articles over 30 days:
- **Likes:** ~2,850 likes/month (spread throughout each day)
- **Comments:** ~1,800 comments/month (spread throughout each day)
- **Views:** ~10,500 views/month (proportional to likes)

## 🆓 Vercel Free Tier (Hobby Plan) Limits

### Cron Job Limits
- ✅ **Up to 2 cron jobs** per project
- ✅ **Daily execution** maximum (no hourly on free tier)
- ✅ **Execution frequency**: Must be daily or less frequent
- ❌ **Hourly schedules** not allowed (requires Pro plan)
- ✅ **No execution count limits** - can run daily forever

### Function Execution Limits
- ✅ **10 second timeout** per function execution
- ✅ **1 million invocations/month** included
- ✅ **100 concurrent executions** maximum
- ✅ **45 minute build time** per deployment
- ✅ **23 GB disk size** limit

### Monthly Included Usage (Free Tier)
- ✅ **4 CPU-hours** per month
- ✅ **360 GB-hours** memory per month  
- ✅ **1,000,000 function invocations** per month
- ✅ **100 GB fast data transfer** per month
- ✅ **100 build hours** per month

### Current Usage Estimate
For **1 daily cron job** with **5 articles**:
- **Function invocations:** 30 per month (1/day × 30 days)
- **CPU/memory:** Very minimal (~few seconds per run)
- **Well within free tier limits** ✅

### Potential Issues
- ⚠️ If you have **many articles** (50+), the function might timeout
- ⚠️ Each article update + comment insert = multiple database operations
- ⚠️ With 100 articles, you'd have ~200+ database operations per run

## 🚀 Scaling Considerations

### Current Setup (Good for):
- ✅ **1-20 articles** - Works perfectly
- ✅ **20-50 articles** - Should work fine
- ⚠️ **50-100 articles** - May approach timeout limits
- ❌ **100+ articles** - Will likely timeout

### If You Have Many Articles

**Option 1:** Process in batches
```typescript
// Process 10 articles at a time
const batchSize = 10;
for (let i = 0; i < articles.length; i += batchSize) {
  const batch = articles.slice(i, i + batchSize);
  await Promise.all(batch.map(processArticle));
}
```

**Option 2:** Upgrade to Pro
- Allows hourly cron (24x more frequent)
- Longer timeout limits
- More reliable for large datasets

**Option 3:** Filter to recent articles only
- Only boost articles published in last 30 days
- Reduces processing load

## 📝 Current Behavior Summary

| Metric | Per Article Per Day | Notes |
|--------|-------------------|-------|
| **Likes** | ~19 (spread hourly) | 80% chance/hour |
| **Comments** | ~12 (spread hourly) | 50% chance/hour |
| **Views** | ~70 (proportional) | 3-4x of likes |

**Per Day Total (5 articles):**
- Likes: ~95 (spread throughout day)
- Comments: ~60 (spread throughout day)
- Views: ~350 (proportional to likes, scales naturally)

## 💡 Optimization Tips

1. **Add columns to database** - Run `fix_missing_columns.sql` for full functionality
2. **Monitor logs** - Check Vercel function logs for any timeouts
3. **Adjust probability** - Change the 80% chance if you want more/fewer boosts
4. **Change views range** - Adjust from 10-20 to any range you prefer

## 🔧 Customization

To adjust the engagement amounts, edit `app/api/cron/boost-engagement/route.ts`:

```typescript
// Line 231: Likes per hour probability (currently 80%)
const shouldAddLike = Math.random() > 0.2; // 0.2 = 80% chance
// Change to 0.3 for 70% chance, 0.1 for 90% chance

// Line 236: Comments per hour probability (currently 50%)
const shouldAddComment = Math.random() > 0.5; // 0.5 = 50% chance
// Change to 0.4 for 60% chance, 0.6 for 40% chance

// Line 243-245: Views per like ratio (currently 3-4x)
viewsBoost = Math.floor(Math.random() * 2) + 3; // 3-4 views per like
// Change to Math.floor(Math.random() * 3) + 2 for 2-4x (2-4 views per like)
// Change to Math.floor(Math.random() * 4) + 3 for 3-6x (3-6 views per like)
```

