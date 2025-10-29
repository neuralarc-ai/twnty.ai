# 📊 Engagement Boost - Current Implementation Details

## ⏰ Schedule

**Recommended:** Use **external cron service** for hourly execution
- **External Cron:** `0 * * * *` (every hour) - Recommended ✅
- **Vercel Cron:** Daily only (not recommended for natural distribution)

**Current Setup:** Code is optimized for hourly execution to spread engagement throughout the day

## 📈 Per Article Per Day

For each published article, the cron job adds:

### 1. **Likes**
- **Amount:** 1 like per article per hour
- **Probability:** 80% chance per hour
- **Expected per day:** ~19 likes per article (20-30 range over 24 hours)
- **Distribution:** Spread naturally throughout the day ⏰

### 2. **Comments**
- **Amount:** 1 comment per article per hour
- **Probability:** 50% chance per hour
- **Expected per day:** ~12 comments per article (10-15 range over 24 hours)
- **Distribution:** Spread naturally throughout the day ⏰
- **Comments are realistic:** Uses 15 different templates with random names and emails

### 3. **Views**
- **Amount:** 1 view per article per hour
- **Probability:** 60% chance per hour
- **Expected per day:** ~14 views per article (spread throughout day)
- **Distribution:** Spread naturally throughout the day ⏰

## 📊 Example: Daily Totals

If you have **5 published articles**:

- **Likes:** 5 × 25 = **~125 likes per day** (100-150 range)
- **Comments:** 5 × 12.5 = **~62 comments per day** (50-75 range)
- **Views:** 5 × 15 = **~75 views per day** (50-100 range)

## 📅 Monthly Projections

For 5 published articles over 30 days:
- **Likes:** ~3,750 likes/month (3,000-4,500 range)
- **Comments:** ~1,875 comments/month (1,500-2,250 range)
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
| **Likes** | 20-30 (always) | Random range |
| **Comments** | 10-15 (always) | Realistic templates |
| **Views** | 10-20 (always) | Random range |

**Per Day Total (5 articles):**
- Likes: 100-150 (avg: ~125)
- Comments: 50-75 (avg: ~62)
- Views: 50-100 (avg: ~75)

## 💡 Optimization Tips

1. **Add columns to database** - Run `fix_missing_columns.sql` for full functionality
2. **Monitor logs** - Check Vercel function logs for any timeouts
3. **Adjust probability** - Change the 80% chance if you want more/fewer boosts
4. **Change views range** - Adjust from 10-20 to any range you prefer

## 🔧 Customization

To adjust the engagement amounts, edit `app/api/cron/boost-engagement/route.ts`:

```typescript
// Line 225: Likes range (currently 20-30)
const likesBoost = Math.floor(Math.random() * 11) + 20; 
// Change 20 = minimum, 11 = range (so 20-30 = 20 + 0-10)
// Example: For 10-20 likes, use: Math.floor(Math.random() * 11) + 10

// Line 228: Comments range (currently 10-15)
const commentsToAdd = Math.floor(Math.random() * 6) + 10;
// Change 10 = minimum, 6 = range (so 10-15 = 10 + 0-5)
// Example: For 5-10 comments, use: Math.floor(Math.random() * 6) + 5

// Line 231: Views range (currently 10-20)
const viewsBoost = Math.floor(Math.random() * 11) + 10;
// Change 10 = minimum, 11 = range (so 10-20 = 10 + 0-10)
```

