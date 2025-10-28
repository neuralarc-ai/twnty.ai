# 🚀 twnty.ai Blog - Complete Deployment Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Deployment Options](#deployment-options)
5. [Admin Access](#admin-access)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account (already configured)
- Gemini API key from Google AI Studio

### Installation
```bash
# Extract the zip file
unzip twnty-blog.zip
cd twnty-blog

# Install dependencies
npm install

# Configure environment variables (see below)
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

---

## 🔧 Environment Setup

### Required Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin Credentials (CHANGE THESE!)
ADMIN_EMAIL=admin@twnty.ai
ADMIN_PASSWORD=changeme123

# Session Secret (CHANGE THIS!)
SESSION_SECRET=your-secret-key-here-change-this

# Cron Job Secret (CHANGE THIS!)
CRON_SECRET=twnty-cron-secret-2025-change-this
```

### Get Gemini API Key
1. Visit: https://makersuite.google.com/app/apikey
2. Create a new API key
3. Add it in Admin Settings → API Configuration

---

## 💾 Database Configuration

### Database is Already Set Up!
Your Supabase database is fully configured with these tables:
- `twnty_articles` - Blog articles
- `twnty_author` - Author information
- `twnty_comments` - Article comments
- `twnty_settings` - Application settings
- `twnty_users` - Admin users

### Database Schema
All tables are created and ready to use. No additional setup required!

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Settings → Environment Variables
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod
```

### Option 3: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Option 4: Traditional Server
```bash
# On your server
git clone <your-repo>
cd twnty-blog
npm install
npm run build

# Use PM2 for process management
npm i -g pm2
pm2 start npm --name "twnty-blog" -- start
pm2 save
pm2 startup
```

---

## 🔐 Admin Access

### Default Credentials
- **URL**: `https://your-domain.com/admin/login`
- **Email**: `admin@twnty.ai`
- **Password**: `changeme123`

### ⚠️ IMPORTANT: Change Default Credentials!
1. Update `.env.local` with new credentials
2. Restart the application
3. Never use default credentials in production

### Admin Features
- **Dashboard**: Analytics and overview
- **Articles**: Create, edit, delete, schedule articles
- **Settings**: Configure Gemini API, manage users, update author info
- **AI Generation**: Generate articles with Gemini 2.5 Pro

---

## 🎨 Features Overview

### Public Blog
- ✅ Minimal black & white design
- ✅ Responsive layout (mobile, tablet, desktop)
- ✅ Article browsing with images
- ✅ Like and comment functionality
- ✅ Search by hashtags, topics, or free text
- ✅ Share articles on social media
- ✅ About page with author information

### Admin Dashboard
- ✅ Analytics dashboard with charts
- ✅ AI-powered article generation
- ✅ Rich text editor
- ✅ Image, audio, video upload
- ✅ Article scheduling
- ✅ Draft and publish workflow
- ✅ Preview before publishing
- ✅ Engagement automation (likes/views)

---

## 🔄 Engagement Automation

### Automatic Engagement Boost
The blog includes a cron job that runs every 2 hours to:
- Add 6-10 random likes to articles
- Add 100-430 random views to articles

### Setup Cron Job
```bash
# Add to your crontab
0 */2 * * * curl -X POST https://your-domain.com/api/cron/boost-engagement \
  -H "Authorization: Bearer twnty-cron-secret-2025-change-this"
```

Or use a service like:
- **Vercel Cron Jobs** (if deployed on Vercel)
- **EasyCron** (https://www.easycron.com/)
- **Cron-job.org** (https://cron-job.org/)

---

## 🐛 Troubleshooting

### Issue: "Failed to save author information"
**Solution**: Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R) to clear cache

### Issue: "API key not working"
**Solution**: 
1. Verify Gemini API key in Settings
2. Check API key has proper permissions
3. Ensure no rate limits exceeded

### Issue: Articles not showing
**Solution**:
1. Check articles are published (not draft)
2. Verify database connection
3. Check browser console for errors

### Issue: Images not uploading
**Solution**:
1. Check file size (max 10MB)
2. Verify upload directory permissions
3. Check network connection

### Issue: Styles not loading
**Solution**:
1. Clear Next.js cache: `rm -rf .next`
2. Rebuild: `npm run build`
3. Hard refresh browser

---

## 📊 Database Access

### Supabase Dashboard
- **URL**: https://supabase.com/dashboard → your project
- **Project**: Your project name

### Direct Database Access
Use the Supabase SQL Editor or connect via:
```
Host: db.yourproject.supabase.co
Database: postgres
Port: 5432
```

---

## 🔒 Security Best Practices

1. **Change Default Credentials**
   - Update admin email and password
   - Use strong passwords (12+ characters)

2. **Secure API Keys**
   - Never commit `.env.local` to git
   - Use environment variables in production
   - Rotate keys regularly

3. **Enable HTTPS**
   - Use SSL certificates in production
   - Force HTTPS redirects

4. **Rate Limiting**
   - Implement rate limiting for API endpoints
   - Monitor for suspicious activity

5. **Regular Backups**
   - Enable Supabase automatic backups
   - Export data regularly

---

## 📱 Mobile Optimization

The blog is fully responsive and optimized for:
- 📱 Mobile phones (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Large screens (1440px+)

---

## 🎯 Performance Tips

1. **Image Optimization**
   - Use WebP format when possible
   - Compress images before upload
   - Use appropriate image sizes

2. **Caching**
   - Enable CDN caching
   - Use browser caching headers
   - Implement service workers

3. **Code Splitting**
   - Next.js handles this automatically
   - Lazy load components when needed

---

## 📞 Support

### Current Configuration
- **Supabase Project**: [Your project name]
- **Database**: PostgreSQL (Supabase)
- **Framework**: Next.js 14.2
- **Styling**: Tailwind CSS
- **AI**: Gemini 2.5 Pro

### Need Help?
- Check server logs: `npm run dev` (development)
- Check browser console for frontend errors
- Review Supabase logs in dashboard
- Verify all environment variables are set

---

## ✅ Pre-Deployment Checklist

- [ ] Update admin credentials in `.env.local`
- [ ] Add Gemini API key in Settings
- [ ] Update author information in Settings
- [ ] Test article creation and publishing
- [ ] Verify all pages load correctly
- [ ] Test on mobile devices
- [ ] Set up cron job for engagement automation
- [ ] Configure custom domain (if needed)
- [ ] Enable SSL certificate
- [ ] Set up monitoring and analytics

---

## 🎉 You're Ready to Go!

Your twnty.ai blog is fully functional and ready for deployment. All features are working:
- ✅ Beautiful minimal design
- ✅ AI-powered article generation
- ✅ Full admin dashboard
- ✅ Search functionality
- ✅ Social sharing
- ✅ Engagement automation
- ✅ Responsive design

**Current Preview**: [Your deployment URL]

Happy blogging! 🎊