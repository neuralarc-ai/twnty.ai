# ⚠️ Vercel Cron Jobs - Plan Requirements

## Important Notice

**Vercel Cron Jobs require Vercel Pro Plan ($20/month)** and are NOT available on the free tier.

However, the code is set up to support both:
- ✅ **Vercel Cron Jobs** (if you upgrade to Pro)
- ✅ **External Cron Services** (works on free tier - see below)

## Current Setup

**`vercel.json` has been removed** because it causes deployment failures on Vercel free tier.

### If you're on Free Tier (Current Setup):
✅ Use external cron service (see below) - **This is the recommended solution**

### If you want to use Vercel Cron Jobs:
1. **Upgrade to Pro** ($20/month)
   - Go to Vercel Dashboard → Settings → Plan
   - Upgrade to Pro plan
2. **Add vercel.json back**:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/boost-engagement",
         "schedule": "0 * * * *"
       }
     ]
   }
   ```
3. Redeploy - Vercel will automatically detect and configure the cron job

## Using External Cron Service (Free Tier Solution)

Since Vercel Cron requires Pro, use a free external service:

### Recommended: cron-job.org (Free)

1. Sign up at https://cron-job.org (free)
2. Create new cron job:
   - **URL**: `https://your-domain.vercel.app/api/cron/boost-engagement`
   - **Schedule**: `0 * * * *` (every hour)
   - **Method**: GET
   - **Header**: 
     - Name: `Authorization`
     - Value: `Bearer YOUR_CRON_SECRET`
3. Set `CRON_SECRET` in Vercel environment variables
4. Click "Create cronjob"

The API automatically detects external cron vs Vercel cron and handles authentication accordingly.

## How It Works

The API checks for:
- `x-vercel-cron` header → Vercel Cron Job (no auth needed)
- `Authorization: Bearer CRON_SECRET` header → External cron service

Both methods are secure and work correctly!

