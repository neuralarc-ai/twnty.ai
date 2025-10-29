# 🔄 External Cron Service Setup Guide

Since Vercel Cron Jobs require Pro plan and may not detect automatically, we'll use an external cron service to call your API endpoint. This method works on **any Vercel plan** (Free, Pro, Enterprise).

## 🌟 Recommended Services

### Option 1: cron-job.org (Free & Reliable)

**Steps:**

1. **Sign up**: Go to https://cron-job.org/en/ (free account available)

2. **Create New Cron Job**:
   - Click "Create cronjob"
   - **Title**: `twnty-blog-engagement-boost`
   - **Address (URL)**: `https://your-domain.vercel.app/api/cron/boost-engagement`
   - **Schedule**: Every hour
     - Select "Every hour" from dropdown, OR
     - Use cron expression: `0 * * * *`
   - **Request Method**: `GET`
   - **Request Header**: 
     - Name: `Authorization`
     - Value: `Bearer 4ZXakcmzWeC+lHz5oObKxjo7ZbO+LPTuN1M29p4lglA=`
   - **Activate**: Check the box
   - Click "Create cronjob"

3. **Test Immediately**:
   - After creating, click "Run now" to test
   - Check the "Executions" tab to see if it ran successfully

---

### Option 2: EasyCron (Free Tier Available)

**Steps:**

1. **Sign up**: Go to https://www.easycron.com/ (free account)

2. **Create Cron Job**:
   - Click "Add Cron Job"
   - **Cron Job Title**: `Blog Engagement Boost`
   - **URL**: `https://your-domain.vercel.app/api/cron/boost-engagement`
   - **Schedule**: `0 * * * *` (every hour)
   - **HTTP Method**: `GET`
   - **Headers**: 
     ```
     Authorization: Bearer 4ZXakcmzWeC+lHz5oObKxjo7ZbO+LPTuN1M29p4lglA=
     ```
   - Click "Save"

---

### Option 3: GitHub Actions (Free, if using GitHub)

This works perfectly and is completely free!

1. **Create Workflow File**:
   Create: `.github/workflows/cron-engagement.yml`

2. **Add Secret to GitHub**:
   - Go to your GitHub repo
   - Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `CRON_SECRET`
   - Value: `4ZXakcmzWeC+lHz5oObKxjo7ZbO+LPTuN1M29p4lglA=`
   - Click "Add secret"

3. **The workflow file is created below** (I'll add it)

---

## 🔧 Quick Setup Instructions

### Your Current CRON_SECRET:
```
4ZXakcmzWeC+lHz5oObKxjo7ZbO+LPTuN1M29p4lglA=
```

### Your API Endpoint:
```
https://your-domain.vercel.app/api/cron/boost-engagement
```
*(Replace `your-domain.vercel.app` with your actual Vercel domain)*

---

## ✅ Verification Steps

After setting up:

1. **Test the endpoint manually**:
   ```bash
   curl -X GET \
     -H "Authorization: Bearer 4ZXakcmzWeC+lHz5oObKxjo7ZbO+LPTuN1M29p4lglA=" \
     https://your-domain.vercel.app/api/cron/boost-engagement
   ```

2. **Expected Response**:
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

3. **Check your blog after 1 hour**:
   - Likes should have increased
   - Comments should have appeared
   - Views should have increased

---

## 📊 Monitoring

Most external cron services provide:
- Execution history
- Success/failure logs
- Email notifications on failure
- Execution statistics

Check your cron service dashboard regularly to ensure it's running.

---

## 🚨 Troubleshooting

### Endpoint returns 401 Unauthorized
- **Fix**: Verify the CRON_SECRET matches exactly in:
  1. External cron service header
  2. Vercel environment variable

### Endpoint returns 500 Error
- **Fix**: Check Vercel deployment logs for database connection issues

### Cron not running
- **Fix**: 
  1. Verify the URL is correct
  2. Check the schedule is set correctly
  3. Ensure the cron job is "Active" or "Enabled"
  4. Test manually with curl first

---

## 💡 Recommendations

**For Free/Reliable**: Use **cron-job.org** - it's free, reliable, and has good monitoring.

**For GitHub Users**: Use **GitHub Actions** - completely free, integrates with your repo.

