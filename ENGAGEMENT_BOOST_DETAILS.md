# 📊 Engagement Boost - Current Implementation Details

## ⏰ Schedule

**Current:** Runs **once per day** at midnight UTC
- Schedule: `0 0 * * *` (daily at 12:00 AM UTC)
- Frequency: **1 execution per day** (due to Vercel Free Tier limitation)

## 📈 Per Article Per Day

For each published article, the cron job adds:

### 1. **Likes**
- **Amount:** 1 like per article
- **Probability:** 80% chance per article per run
- **Expected per day:** ~0.8 likes per article
- **Range:** 0-1 likes per article per day

### 2. **Comments**
- **Amount:** 1 comment per article
- **Probability:** 80% chance per article per run
- **Expected per day:** ~0.8 comments per article
- **Range:** 0-1 comments per article per day
- **Comments are realistic:** Uses 15 different templates with random names and emails

### 3. **Views**
- **Amount:** Random between 10-20 views
- **Probability:** 100% (always added)
- **Expected per day:** 15 views per article (average of 10-20)
- **Range:** 10-20 views per article per day

## 📊 Example: Daily Totals

If you have **5 published articles**:

- **Likes:** 5 × 0.8 = **~4 likes per day** (0-5 range)
- **Comments:** 5 × 0.8 = **~4 comments per day** (0-5 range)
- **Views:** 5 × 15 = **~75 views per day** (50-100 range)

## 📅 Monthly Projections

For 5 published articles over 30 days:
- **Likes:** ~120 likes/month
- **Comments:** ~120 comments/month
- **Views:** ~2,250 views/month

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
| **Likes** | ~0.8 (80% chance) | Random |
| **Comments** | ~0.8 (80% chance) | Realistic templates |
| **Views** | 10-20 (100% chance) | Random range |

**Per Day Total (5 articles):**
- Likes: ~4
- Comments: ~4  
- Views: ~75

## 💡 Optimization Tips

1. **Add columns to database** - Run `fix_missing_columns.sql` for full functionality
2. **Monitor logs** - Check Vercel function logs for any timeouts
3. **Adjust probability** - Change the 80% chance if you want more/fewer boosts
4. **Change views range** - Adjust from 10-20 to any range you prefer

## 🔧 Customization

To adjust the engagement amounts, edit `app/api/cron/boost-engagement/route.ts`:

```typescript
// Line 226-227: Likes probability
const shouldAddLike = Math.random() > 0.2; // Change 0.2 to adjust (0.2 = 80% chance)

// Line 231: Comments probability  
const shouldAddComment = Math.random() > 0.2; // Same adjustment

// Line 234: Views range
const viewsBoost = Math.floor(Math.random() * 11) + 10; // Change 10 and 11 for range
```

