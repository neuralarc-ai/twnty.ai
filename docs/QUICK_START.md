# ⚡ QUICK START - Get Your Blog Running in 10 Minutes

## 🎯 Current Status

✅ **Application is running**: https://3000-346bd49e-aad1-4764-a334-870a9330eaca.proxy.daytona.works  
⚠️ **Supabase not configured yet** - Follow steps below to complete setup

---

## 🚀 3 Simple Steps to Complete Setup

### Step 1: Configure Supabase (5 minutes)

You mentioned you have a Supabase project. Let's connect it:

1. **Get your Supabase credentials**:
   - Go to your Supabase project dashboard
   - Click "Settings" → "API"
   - Copy:
     - Project URL (looks like: `https://xxxxx.supabase.co`)
     - Anon/Public key (starts with `eyJ...`)

2. **Update `.env.local` file** in the `twnty-blog` folder:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ADMIN_EMAIL=admin@twnty.ai
   ADMIN_PASSWORD=changeme123
   ```

3. **Run the database setup**:
   - In Supabase dashboard, click "SQL Editor"
   - Click "New query"
   - Open `SUPABASE_SETUP.sql` file
   - Copy ALL the SQL code
   - Paste in Supabase SQL Editor
   - Click "Run"
   - You should see "Success. No rows returned"

4. **Restart the development server**:
   ```bash
   # Stop current server (Ctrl+C in terminal)
   cd twnty-blog
   npm run dev
   ```

### Step 2: Get Gemini API Key (3 minutes)

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key" or "Get API Key"
4. Copy the key (starts with `AIza...`)
5. Keep it safe - you'll add it in the admin dashboard

### Step 3: Configure Your Blog (2 minutes)

1. **Log in to admin**:
   - URL: https://3000-346bd49e-aad1-4764-a334-870a9330eaca.proxy.daytona.works/admin/login
   - Email: `admin@twnty.ai`
   - Password: `changeme123`

2. **Add Gemini API Key**:
   - Go to "Settings" in sidebar
   - Click "API Configuration" tab
   - Paste your Gemini API key
   - Click "Save API Settings"

3. **Configure Author Info** (optional but recommended):
   - Click "About Author" tab
   - Add your title (e.g., "Founder & Chief Editor")
   - Write your bio
   - Upload your photo
   - Add social links
   - Click "Save Author Info"

---

## 🎉 You're Done! Now Create Your First Article

1. **Click "New Article"** in the admin sidebar
2. **Click the magic wand icon** ✨ (Generate with AI)
3. **Enter a topic**: e.g., "The Future of Remote Work in 2025"
4. **Click "Generate Article"**
   - AI will write 800+ words
   - Automatic hashtags generated
5. **Upload a featured image** (drag & drop)
6. **Click "Publish Now"**
7. **View your article** on the blog!

---

## 🎨 What You're Getting

### Beautiful Design
- Minimal black & white aesthetic (matching your reference)
- "twnty.ai" brand typography
- Responsive grid layout
- Professional article cards
- Smooth interactions

### Powerful Features
- AI article generation (800+ words)
- Like & comment system
- Analytics dashboard
- Article scheduling
- Media attachments
- SEO hashtags
- Author profile

---

## 📱 Test Your Blog

After setup, test these features:

1. **Homepage**: View article grid
2. **Article Page**: Click an article, test like/comment
3. **About Page**: Check author information
4. **Admin Dashboard**: View analytics
5. **Create Article**: Use AI generation
6. **Edit Article**: Modify existing content

---

## ⚠️ Important Notes

### Before Going Live

- [ ] Run Supabase SQL script
- [ ] Update .env.local with real credentials
- [ ] Change admin password
- [ ] Add Gemini API key
- [ ] Configure author information
- [ ] Create at least one test article

### Security

- **Change default password** immediately
- **Never commit** `.env.local` to version control
- **Keep API keys** secure
- **Use strong passwords** (12+ characters)

---

## 🆘 Troubleshooting

### "Supabase is not configured"
→ Update `.env.local` with your Supabase credentials and restart server

### "Failed to generate article"
→ Add Gemini API key in Settings → API Configuration

### "Database error"
→ Run the SQL script in Supabase SQL Editor

### "Can't log in"
→ Check credentials in `.env.local` match what you're entering

---

## 📚 Full Documentation

For detailed information, see:
- `README.md` - Complete overview
- `SETUP_GUIDE.md` - Detailed setup
- `DATABASE_SETUP.md` - Database details
- `DEPLOYMENT_GUIDE.md` - Production deployment

---

## 🎊 Ready to Blog!

Once you complete the 3 steps above, your blog will be fully functional and ready to use!

**Questions?** Check the documentation files or review the setup guides.

**Happy blogging!** ✍️

---

Built with ❤️ by Helium AI for twnty.ai