# ✅ Vercel Cron Jobs Setup Guide

## Configuration Complete

Your project is now configured to use Vercel Cron Jobs!

## What's Configured

1. ✅ **vercel.json** - Cron job configuration added
2. ✅ **API Route** - `/api/cron/boost-engagement` ready for Vercel cron
3. ✅ **Authentication** - Automatically handles Vercel's `x-vercel-cron` header

## Setup Steps

### 1. Deploy to Vercel

Once you push this code, Vercel will automatically detect the `vercel.json` file and set up the cron job.

### 2. Verify Environment Variables

Make sure these are set in Vercel Dashboard → Settings → Environment Variables:

- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- ❌ `CRON_SECRET` - **NOT NEEDED** for Vercel cron (only for external services)

### 3. Check Cron Job Status

After deployment:
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Crons**
2. You should see: `boost-engagement` scheduled for `0 * * * *` (every hour)
3. Status should be **Active**

### 4. Test the Cron Job

You can manually trigger a test:
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Crons**
2. Click on the cron job
3. Click **"Run Now"** to test immediately
4. Check the logs to verify it works

## How It Works

1. **Vercel automatically calls** `/api/cron/boost-engagement` every hour
2. **API detects** `x-vercel-cron` header (sent automatically by Vercel)
3. **No authentication needed** - Vercel's header is trusted
4. **API processes** all published articles and adds engagement boosts

## Limitations (Free Tier)

If you're on Vercel Free tier, you may encounter:

- ⏱️ **Limited execution time** - Cron jobs may timeout on very large operations
- 📊 **Limited logging** - Some logs might not be visible
- 🔄 **Execution frequency** - May have rate limits

**These limitations are usually fine** for the engagement boost feature!

## Troubleshooting

### Cron doesn't appear in dashboard
- Wait a few minutes after deployment
- Check that `vercel.json` is in the root directory
- Verify the deployment succeeded

### Cron fails with 401/403
- Check environment variables are set
- Verify Supabase credentials are correct
- Check Vercel function logs for detailed errors

### Cron runs but no updates
- Check Supabase database connection
- Verify articles have `status = 'published'`
- Check Vercel function logs for errors

## Next Steps

1. **Push this code** to trigger a new deployment
2. **Wait for deployment** to complete
3. **Check Vercel Dashboard** → Settings → Crons
4. **Monitor** the first few runs in the logs

The cron job will run automatically every hour starting after the first successful deployment! 🎉

