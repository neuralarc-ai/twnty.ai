# 📅 Vercel Cron Job Setup Guide

This guide will walk you through setting up the automated engagement boost cron job on Vercel.

## 📋 Prerequisites

- Your blog deployed on Vercel
- Access to Vercel Dashboard
- `CRON_SECRET` environment variable configured

---

## 🚀 Step-by-Step Instructions

### Step 1: Create `vercel.json` File

1. **If you haven't already**, create a file named `vercel.json` in your project root directory
2. **Add this content**:

```json
{
  "crons": [{
    "path": "/api/cron/boost-engagement",
    "schedule": "0 * * * *"
  }]
}
```

**Schedule Explanation:**
- `"0 * * * *"` = Runs every hour at minute 0 (00:00, 01:00, 02:00, etc.)
- Format: `minute hour day month weekday`

### Step 2: Commit and Push `vercel.json`

```bash
git add vercel.json
git commit -m "Add Vercel cron job configuration"
git push origin main
```

**Note:** Vercel will automatically detect the `vercel.json` file on your next deployment.

### Step 3: Set Environment Variable in Vercel

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your **project** (twnty-blog or your project name)
3. Click on **Settings** (top menu)
4. Click on **Environment Variables** (left sidebar)
5. **Add a new variable**:
   - **Key**: `CRON_SECRET`
   - **Value**: Generate a secure random string (see below)
   - **Environments**: Select all (Production, Preview, Development)
6. Click **Save**

**Generate a secure secret:**
```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Using online generator
# Visit: https://www.random.org/strings/
```

**Example secret:** `aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE`

### Step 4: Deploy to Vercel

The cron job will be automatically configured when you deploy:

**Option A: Via Git (Automatic)**
1. Push your code to GitHub/GitLab/Bitbucket
2. Vercel will automatically detect the new `vercel.json` file
3. Redeploy your project (or wait for automatic deployment)

**Option B: Via Vercel CLI**
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy
vercel --prod
```

### Step 5: Verify Cron Job is Active

1. Go to **Vercel Dashboard** → Your Project
2. Click on **Settings** → **Crons** (left sidebar)
3. You should see:
   - **Path**: `/api/cron/boost-engagement`
   - **Schedule**: `0 * * * *` (Every hour)
   - **Status**: Active/Enabled

**Note:** Cron jobs only work on Vercel Pro plan and above. Free tier users need to use external cron services.

---

## 🧪 Testing

### Test the Cron Endpoint Manually

Before relying on the cron, test the endpoint manually:

```bash
# Get your CRON_SECRET from Vercel Dashboard → Settings → Environment Variables
# Replace YOUR_CRON_SECRET with your actual secret
# Replace your-domain.vercel.app with your actual domain

curl -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.vercel.app/api/cron/boost-engagement
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Updated X articles with engagement boosts",
  "articlesUpdated": X,
  "likesAdded": X,
  "commentsAdded": X,
  "viewsAdded": X
}
```

### Verify Cron Job Execution

1. **After waiting at least 1 hour**, check your database:
   - Likes should have increased
   - Comments should have been added
   - Views should have increased

2. **Check Vercel Logs**:
   - Go to **Vercel Dashboard** → Your Project → **Deployments**
   - Click on the latest deployment
   - Check **Functions** tab for cron execution logs

---

## 📊 Monitoring & Troubleshooting

### Check Cron Job Status

1. Vercel Dashboard → Project → Settings → **Crons**
2. View next execution time
3. Check execution history (if available)

### Common Issues

#### Issue 1: Cron Job Not Running

**Symptoms:**
- No engagement increase after hours
- No logs in Vercel

**Solutions:**
1. **Check Vercel Plan**: Cron jobs require Pro plan or higher
   - Free tier: Use external cron service (cron-job.org)
2. **Verify `vercel.json`**: Ensure file exists in root directory
3. **Check Deployment**: Redeploy after adding `vercel.json`
4. **Verify Environment Variable**: `CRON_SECRET` must be set

#### Issue 2: 401 Unauthorized Error

**Symptoms:**
- Cron endpoint returns `{ "error": "Unauthorized" }`

**Solutions:**
1. Check `CRON_SECRET` environment variable is set correctly
2. Ensure it matches in all environments (Production, Preview, Development)
3. Verify the Authorization header format: `Bearer YOUR_SECRET`

#### Issue 3: Cron Runs But No Updates

**Symptoms:**
- Cron executes successfully but no likes/comments added

**Solutions:**
1. Check database connection
2. Verify Supabase credentials are correct
3. Check Supabase logs for errors
4. Ensure articles have `status = 'published'`

---

## 🔄 Updating the Cron Schedule

To change how often the cron runs, update `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/boost-engagement",
    "schedule": "0 */2 * * *"  // Every 2 hours
  }]
}
```

**Common Schedule Patterns:**
- `"0 * * * *"` - Every hour
- `"0 */2 * * *"` - Every 2 hours
- `"*/30 * * * *"` - Every 30 minutes
- `"0 9,17 * * *"` - At 9 AM and 5 PM daily

**After updating**, redeploy your project.

---

## 💰 Vercel Plan Requirements

**Important:** Vercel Cron Jobs are available on:
- ✅ **Pro Plan** ($20/month)
- ✅ **Enterprise Plan**
- ❌ **Free Plan** (Not available)

**Free Plan Alternative:**
If you're on the free tier, use an external cron service:
- See `CRON_SETUP.md` → Option 2 for instructions
- Use cron-job.org or EasyCron.com
- Set schedule to every hour: `0 * * * *`

---

## ✅ Verification Checklist

After setup, verify:

- [ ] `vercel.json` file exists in project root
- [ ] `CRON_SECRET` environment variable is set in Vercel
- [ ] Cron job appears in Vercel Dashboard → Settings → Crons
- [ ] Manual test of endpoint returns success
- [ ] After 1+ hours, articles show increased engagement

---

## 📞 Need Help?

If you encounter issues:
1. Check Vercel logs: Dashboard → Deployments → Functions
2. Verify all environment variables are set
3. Test the endpoint manually first
4. Check Vercel plan includes cron jobs (Pro+)

---

**Your cron job is now configured!** 🎉

The system will automatically:
- Add 20-30 likes per article per day
- Add 20-30 comments per article per day
- Increase views gradually

All engagement is distributed naturally throughout the day.

