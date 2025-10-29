# 🚀 GitHub Actions Cron Setup (Recommended - FREE!)

GitHub Actions is the best free alternative for cron jobs. It runs directly from your GitHub repository and is completely free for public repos.

## ✅ Setup Steps

### Step 1: Add Secrets to GitHub

1. Go to your GitHub repository: `https://github.com/neuralarc-ai/twnty.ai`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

**Add these two secrets:**

**Secret 1: CRON_SECRET**
- **Name**: `CRON_SECRET`
- **Value**: `4ZXakcmzWeC+lHz5oObKxjo7ZbO+LPTuN1M29p4lglA=`
- Click **Add secret**

**Secret 2: VERCEL_DOMAIN**
- **Name**: `VERCEL_DOMAIN`
- **Value**: Your Vercel domain (e.g., `twnty-ai.vercel.app` or `your-custom-domain.com`)
- Click **Add secret**

### Step 2: Verify Workflow File

The workflow file is already created at: `.github/workflows/cron-engagement.yml`

It will automatically:
- Run every hour
- Call your Vercel API endpoint
- Include proper authentication
- Log results

### Step 3: Push to GitHub

The workflow file is already in your repo, but let's make sure it's committed:

```bash
git add .github/workflows/cron-engagement.yml
git commit -m "Add GitHub Actions cron workflow"
git push origin main
```

### Step 4: Enable GitHub Actions

1. Go to your GitHub repo
2. Click **Actions** tab
3. If prompted, click **"I understand my workflows, go ahead and enable them"**
4. You should see the workflow file listed

### Step 5: Test Manually

1. Go to **Actions** tab → **Boost Blog Engagement** workflow
2. Click **Run workflow** (dropdown on the right)
3. Click **Run workflow** button
4. Watch it execute in real-time
5. Click on the run to see logs

### Step 6: Verify It Works

After the first run:
1. Check the Actions tab for success ✅
2. Check your blog - likes/comments should have increased
3. View execution logs to see the response

---

## 📊 Monitoring

### View Execution History:
- **Actions** tab → **Boost Blog Engagement** workflow
- See all past runs, success/failure status
- Click any run to see detailed logs

### Automatic Scheduling:
- Runs every hour automatically
- No manual intervention needed
- Free for unlimited executions

### Failure Notifications:
- GitHub will show failed runs in the Actions tab
- You can configure email notifications in GitHub settings

---

## 🔧 Configuration

### Change Schedule:
Edit `.github/workflows/cron-engagement.yml`:

```yaml
schedule:
  - cron: '0 * * * *'  # Every hour
  # - cron: '0 */2 * * *'  # Every 2 hours
  # - cron: '*/30 * * * *'  # Every 30 minutes
```

### Manual Trigger:
You can always trigger it manually:
- Actions → Boost Blog Engagement → Run workflow

---

## ✅ Advantages of GitHub Actions

1. **100% Free** - No cost, unlimited runs
2. **Reliable** - GitHub's infrastructure
3. **Integrated** - Everything in your repo
4. **Transparent** - Full execution logs
5. **Flexible** - Easy to modify schedule
6. **No Plan Required** - Works on any Vercel plan

---

## 🚨 Troubleshooting

### Workflow doesn't run
- **Check**: Actions are enabled in repo settings
- **Check**: Workflow file is in `.github/workflows/` directory
- **Check**: File is committed and pushed

### 401 Unauthorized Error
- **Fix**: Verify `CRON_SECRET` secret matches Vercel environment variable
- **Fix**: Check secret name is exactly `CRON_SECRET` (case-sensitive)

### Domain Error
- **Fix**: Verify `VERCEL_DOMAIN` secret is set correctly
- **Fix**: Don't include `https://` - just the domain (e.g., `twnty-ai.vercel.app`)

### No secrets found
- **Fix**: Make sure secrets are added in repo Settings → Secrets → Actions
- **Fix**: Secrets are case-sensitive

---

**Your cron job will now run automatically every hour via GitHub Actions!** 🎉

