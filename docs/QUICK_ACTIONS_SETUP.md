# ✅ Quick GitHub Actions Setup Verification

## What You've Done So Far:
✅ Added `CRON_SECRET` secret  
✅ Added `VERCEL_DOMAIN` secret  
✅ Workflow file is in `.github/workflows/cron-engagement.yml`  
✅ Code is pushed to GitHub  

## Next Steps:

### Step 1: Check GitHub Actions Tab

1. Go to: `https://github.com/neuralarc-ai/twnty.ai`
2. Click on the **"Actions"** tab (top navigation)
3. You should see:
   - Left sidebar: **"Boost Blog Engagement"** workflow listed
   - If you don't see it, refresh the page or wait 1-2 minutes

### Step 2: Enable Workflows (If Prompted)

If you see a message like:
> "Workflows aren't being run on this forked repository"

Or:
> "I understand my workflows, go ahead and enable them"

- **Click the button to enable workflows**

### Step 3: Test the Workflow Manually

1. In the **Actions** tab
2. Click **"Boost Blog Engagement"** in the left sidebar
3. Click **"Run workflow"** button (top right, dropdown)
4. Select branch: **main** (if prompted)
5. Click green **"Run workflow"** button

### Step 4: Watch It Execute

After clicking "Run workflow":
1. You'll see a new run appear
2. Click on the run to see real-time execution
3. You'll see logs showing:
   - "Call Engagement Boost API" step
   - HTTP response code (should be 200)
   - Response body with article counts

### Step 5: Verify It Worked

Check the logs - you should see:
```
Response Code: 200
Response Body: {
  "success": true,
  "message": "Updated X articles with engagement boosts",
  "articlesUpdated": X,
  "likesAdded": X,
  "commentsAdded": X,
  "viewsAdded": X
}
```

✅ If you see this, it's working perfectly!

---

## 🔍 Troubleshooting

### Can't Find "Boost Blog Engagement" Workflow?

**Solution:**
1. Make sure you're on the **Actions** tab
2. Check left sidebar - workflows are listed there
3. Try refreshing the page
4. Verify the file exists: `.github/workflows/cron-engagement.yml`

### Workflow Shows Red ❌ (Failed)

**Check the logs:**
1. Click on the failed run
2. Expand "Call Engagement Boost API" step
3. Look for error messages:

**Common errors:**
- **401 Unauthorized**: Check `CRON_SECRET` matches exactly
- **Could not resolve host**: Check `VERCEL_DOMAIN` is correct (no https://)
- **404 Not Found**: Check domain is correct and API route exists

### Secrets Not Found

**Fix:**
1. Go to: Settings → Secrets and variables → Actions
2. Verify both secrets exist:
   - `CRON_SECRET`
   - `VERCEL_DOMAIN`
3. Check they're spelled exactly (case-sensitive)

---

## 🎯 What Happens Next

Once working:
- **Automatic**: Runs every hour automatically
- **Manual**: You can trigger it anytime from Actions tab
- **Monitoring**: View all runs in the Actions tab
- **Logs**: See detailed execution logs for each run

---

## ✅ Success Indicators

You'll know it's working when:
1. ✅ Workflow appears in Actions sidebar
2. ✅ Manual run shows green checkmark ✅
3. ✅ Logs show "Response Code: 200"
4. ✅ Your blog articles show increased likes/comments after runs

---

**Need help?** Check the logs in the Actions tab - they'll show exactly what's happening!

