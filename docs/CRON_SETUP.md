# Automated Engagement Boost Setup

## 🤖 Automatic Likes, Comments & Views Increase

Your blog includes an automated system that increases engagement metrics every hour:
- **Likes**: Adds 1 like per article per hour (80% chance), resulting in 20-30 likes per day
- **Comments**: Adds 1 comment per article per hour (80% chance), resulting in 20-30 comments per day
- **Views**: Randomly increases by 10-20 per article per hour

## 🔧 Setup Instructions

### Option 1: Vercel Cron Jobs (Recommended for Vercel Deployment)

1. Create `vercel.json` in your project root:
```json
{
  "crons": [{
    "path": "/api/cron/boost-engagement",
    "schedule": "0 * * * *"
  }]
}
```

2. Deploy to Vercel
3. Cron job will run automatically every hour

### Option 2: External Cron Service (For Any Hosting)

1. Go to **cron-job.org** or **EasyCron.com**
2. Create a new cron job:
   - **URL**: `https://your-domain.com/api/cron/boost-engagement`
   - **Schedule**: Every hour (`0 * * * *`)
   - **Method**: GET
   - **Headers**: Add `Authorization: Bearer your-cron-secret-key`

3. Your cron secret is in `.env.local`:
   ```
   CRON_SECRET=twnty-blog-cron-secret-2025
   ```

### Option 3: GitHub Actions (For GitHub Hosting)

1. Create `.github/workflows/engagement-boost.yml`:
```yaml
name: Boost Engagement
on:
  schedule:
    - cron: '0 * * * *'
  workflow_dispatch:

jobs:
  boost:
    runs-on: ubuntu-latest
    steps:
      - name: Call Engagement Boost API
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-domain.com/api/cron/boost-engagement
```

2. Add `CRON_SECRET` to GitHub Secrets

### Testing the Cron Job

Test manually by calling:
```bash
curl -X GET \
  -H "Authorization: Bearer twnty-blog-cron-secret-2025" \
  http://localhost:3000/api/cron/boost-engagement
```

## 📊 How It Works

1. Every hour, the cron job runs
2. Fetches all published articles
3. For each article:
   - Adds 1 like (80% chance) - gradually building to 20-30 likes per day
   - Adds 1 comment (80% chance) - gradually building to 20-30 comments per day
   - Adds 10-20 random views
4. Updates the database
5. Returns success status with counts

The system distributes engagement naturally throughout the day, with likes and comments appearing at random intervals to simulate organic growth.

## 🔒 Security

- The endpoint requires an Authorization header with your secret key
- Only published articles are affected
- Changes are logged in the response

## 📈 Monitoring

Check the cron job logs to see:
- Number of articles updated
- Total likes and views added
- Any errors or issues

---

**Note**: Make sure to set up the cron job after deploying your blog to production!