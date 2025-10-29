# ⚠️ Vercel Cron Jobs - Plan Requirements

## Important Notice

**Vercel Cron Jobs require Vercel Pro Plan ($20/month)** and are NOT available on the free tier.

However, the code is set up to support both:
- ✅ **Vercel Cron Jobs** (if you upgrade to Pro)
- ✅ **External Cron Services** (works on free tier - see below)

## Current Setup

The `vercel.json` file is configured for Vercel Cron Jobs. If you're on the free tier:

1. **Option 1: Remove vercel.json** (if staying on free tier)
   ```bash
   git rm vercel.json
   git commit -m "Remove vercel.json for free tier"
   git push
   ```
   Then use external cron service (see below)

2. **Option 2: Upgrade to Pro** ($20/month)
   - Go to Vercel Dashboard → Settings → Plan
   - Upgrade to Pro plan
   - The cron job will automatically work

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

