# 🔧 GitHub Actions Cron Job Setup Guide

This guide will help you set up automated engagement boosts using GitHub Actions.

## 📋 Prerequisites

- Your blog deployed on Vercel (or any hosting platform)
- GitHub repository with Actions enabled
- Admin access to your GitHub repository

---

## 🚀 Step-by-Step Setup

### Step 1: Add Required Secrets to GitHub

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add the following:

#### Required Secrets:

**1. `CRON_SECRET`**
   - Value: Your cron secret (should match `CRON_SECRET` in Vercel)
   - Example: `twnty-blog-cron-secret-2025`
   - This must match exactly with your Vercel environment variable

**2. `VERCEL_DOMAIN`**
   - Value: Your Vercel deployment domain
   - Examples:
     - `your-blog.vercel.app` (Vercel default)
     - `twnty.ai` (custom domain)
   - Important: Use the domain WITHOUT `https://` prefix

#### Optional Secret (if Deployment Protection is enabled):

**3. `VERCEL_BYPASS_TOKEN`**
   - Value: Your Vercel bypass token (only if deployment protection is enabled)
   - How to get it:
     1. Go to Vercel Dashboard → Your Project → Settings → Deployments
     2. Enable "Vercel Authentication" (if not already enabled)
     3. Generate a bypass token
   - If deployment protection is disabled, you can skip this

---

### Step 2: Verify Workflow File Exists

The workflow file should already exist at:
```
.github/workflows/cron-engagement.yml
```

If it doesn't exist, it will be created automatically. The workflow:
- Runs every hour (`0 * * * *`)
- Can be manually triggered from the Actions tab
- Calls your API endpoint with proper authentication

---

### Step 3: Match Secrets in Vercel

Ensure your Vercel environment variables match:

1. Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. Add/verify these variables (for Production, Preview, and Development):

```
CRON_SECRET=your-secret-key-here  ← Must match GitHub secret
```

**Important**: The `CRON_SECRET` in Vercel must match exactly with the `CRON_SECRET` in GitHub Secrets.

---

### Step 4: Test the Workflow

1. Go to your GitHub repository → **Actions** tab
2. Find the "Boost Blog Engagement" workflow
3. Click **Run workflow** (dropdown button) → **Run workflow**
4. Watch the workflow run and check for errors

**Expected Result**:
- ✅ HTTP Status Code: 200
- ✅ Response showing success message with counts

**Common Errors**:

| Error | Solution |
|-------|----------|
| `CRON_SECRET is not set` | Add `CRON_SECRET` to GitHub Secrets |
| `VERCEL_DOMAIN is not set` | Add `VERCEL_DOMAIN` to GitHub Secrets |
| HTTP 401 Unauthorized | Check that `CRON_SECRET` matches in both GitHub and Vercel |
| HTTP 404 Not Found | Check that `VERCEL_DOMAIN` is correct |
| Connection timeout | Check if deployment protection is enabled and add bypass token |

---

### Step 5: Verify It's Working

After a successful run, check your blog:
- Likes should gradually increase (20-30 per day per article)
- Comments should appear throughout the day
- Views should increase

---

## 🔍 Troubleshooting

### Issue: Workflow fails with "Unauthorized"

**Solution**:
1. Verify `CRON_SECRET` in GitHub Secrets matches Vercel environment variable
2. Ensure the secret doesn't have extra spaces or quotes
3. Check both Production and Preview environments in Vercel

### Issue: Workflow fails with "Failed to connect"

**Solution**:
1. Verify `VERCEL_DOMAIN` is correct (no `https://` prefix)
2. Test the URL manually: `https://your-domain/api/cron/boost-engagement`
3. If deployment protection is enabled, add `VERCEL_BYPASS_TOKEN` secret

### Issue: Workflow runs but engagement doesn't increase

**Solution**:
1. Check the workflow logs for the API response
2. Verify the API endpoint is accessible
3. Check Vercel function logs for errors
4. Ensure articles are published (not draft)

---

## 📊 Monitoring

### View Workflow Runs

1. Go to **Actions** tab in GitHub
2. Click on "Boost Blog Engagement" workflow
3. View run history and logs

### View API Logs

1. Go to **Vercel Dashboard** → **Your Project** → **Functions**
2. Find `/api/cron/boost-engagement`
3. View execution logs and response times

---

## ⚙️ Advanced Configuration

### Change Schedule

Edit `.github/workflows/cron-engagement.yml`:

```yaml
schedule:
  - cron: '0 * * * *'  # Every hour
  # - cron: '0 */2 * * *'  # Every 2 hours
  # - cron: '0 9 * * *'  # Every day at 9 AM
```

### Manual Trigger

You can manually trigger the workflow:
1. Go to **Actions** tab
2. Select "Boost Blog Engagement"
3. Click **Run workflow** → **Run workflow**

---

## 🎯 Alternative: Use Vercel Cron Jobs (Recommended)

If you're deploying on Vercel, **Vercel Cron Jobs** are recommended over GitHub Actions because:
- ✅ Built-in, no external service needed
- ✅ More reliable (no GitHub Actions quota limits)
- ✅ Faster execution
- ✅ Better integration with Vercel deployments

See `CRON_SETUP.md` for Vercel Cron Jobs setup instructions.

---

## ✅ Checklist

- [ ] Added `CRON_SECRET` to GitHub Secrets
- [ ] Added `VERCEL_DOMAIN` to GitHub Secrets
- [ ] Added `VERCEL_BYPASS_TOKEN` (if deployment protection enabled)
- [ ] Verified `CRON_SECRET` matches in Vercel environment variables
- [ ] Tested workflow manually from Actions tab
- [ ] Verified workflow runs successfully
- [ ] Checked blog for increasing engagement metrics

---

## 📚 Related Documentation

- [CRON_SETUP.md](./CRON_SETUP.md) - Vercel Cron Jobs setup
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Full deployment guide

---

**Note**: The workflow runs automatically every hour. You can monitor it in the Actions tab to ensure it's working correctly.
