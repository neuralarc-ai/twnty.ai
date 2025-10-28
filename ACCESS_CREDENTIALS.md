# twnty.ai Blog - Access Credentials & Quick Start

## 🌐 Live Application URLs

### Public Blog
**Homepage**: https://3000-346bd49e-aad1-4764-a334-870a9330eaca.proxy.daytona.works

### Admin Dashboard
**Login Page**: https://3000-346bd49e-aad1-4764-a334-870a9330eaca.proxy.daytona.works/admin/login

## 🔑 Default Admin Credentials

**Email**: `admin@twnty.ai`  
**Password**: `changeme123`

⚠️ **CRITICAL**: Change these credentials immediately after first login!

## 📋 First-Time Setup Steps

### 1. Configure Supabase (REQUIRED)

Your blog needs a Supabase database to function. Follow these steps:

1. **Open your Supabase project dashboard**
2. **Go to SQL Editor** (left sidebar)
3. **Create a new query**
4. **Copy the entire contents** of `SUPABASE_SETUP.sql`
5. **Paste and run** the SQL script
6. **Verify tables were created** in Table Editor

### 2. Update Environment Variables (REQUIRED)

Edit `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
ADMIN_EMAIL=admin@twnty.ai
ADMIN_PASSWORD=changeme123
SESSION_SECRET=generate-a-random-secret-key
```

**After updating, restart the server**:
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### 3. Get Gemini API Key (REQUIRED for AI)

1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key
5. Log in to admin dashboard
6. Go to Settings → API Configuration
7. Paste your API key and save

### 4. Configure Author Information (OPTIONAL)

1. Log in to admin dashboard
2. Go to Settings → About Author
3. Fill in:
   - Your title (e.g., "Founder & Chief Editor")
   - Description (your bio)
   - Upload your photo
   - Add social links (LinkedIn, Twitter, Website)
4. Click "Save Author Info"

## 🎯 Quick Feature Tour

### Creating Your First Article with AI

1. **Log in** to admin dashboard
2. **Click "New Article"** in sidebar
3. **Click the magic wand icon** (✨)
4. **Enter your topic**: e.g., "The Future of Remote Work"
5. **Click "Generate Article"**
   - AI will create 800+ words
   - Automatic hashtags generated
   - Professional, engaging content
6. **Upload a featured image** (drag & drop)
7. **Add media** (optional):
   - Audio URL
   - Video URL
   - External links
8. **Choose publishing**:
   - Save as Draft (review later)
   - Publish Now (goes live immediately)
   - Schedule (set future date/time)
9. **Click "Create Article"**

### Managing Articles

- **View all articles**: Admin → Articles
- **Edit article**: Click edit icon (pencil)
- **Delete article**: Click trash icon (with confirmation)
- **View published**: Click eye icon

### Dashboard Analytics

The dashboard shows:
- **Total Articles**: All articles (draft, published, scheduled)
- **Total Visitors**: Unique page views
- **Total Likes**: Across all articles
- **Total Comments**: All comments received
- **Recent Articles**: Latest 5 articles
- **Popular Articles**: Top 5 by views

## 🎨 Design Features

Your blog implements the minimal black & white design from your reference:

✅ **Typography**
- Brand name: "twnty.ai" in elegant serif font
- Headings: Georgia serif, bold
- Body text: System fonts for readability

✅ **Layout**
- Clean grid system
- Generous whitespace
- Thin black borders
- Responsive breakpoints

✅ **Article Display**
- Featured article (larger, prominent)
- Grid of recent articles
- Image, title, excerpt, stats
- Hashtags for SEO

✅ **Article Reading**
- Image on left (desktop) / top (mobile)
- Content flows naturally
- Like button with count
- Comment section
- Media attachments

✅ **Interactions**
- Smooth hover effects
- Subtle transitions
- Clear focus states
- Touch-friendly buttons

## 🔧 Admin Features Summary

### Dashboard
- Analytics overview
- Recent articles list
- Popular articles ranking
- Quick access to all features

### Articles Management
- Create new articles (manual or AI)
- Edit existing articles
- Delete articles (with confirmation)
- View published articles
- Schedule future posts

### AI Article Generation
- Magic wand button in article editor
- Enter topic or prompt
- Generates 800+ word articles
- Automatic hashtag generation
- Professional, engaging content

### Media Management
- Drag & drop image upload
- Audio file URL support
- Video file URL support
- External links management
- Preview before publishing

### Settings
- **API Configuration**: Gemini API key
- **User Management**: Add admin users
- **Author Info**: Configure about page

## 📱 Mobile Experience

The blog is fully responsive:
- **Mobile**: Single column, touch-friendly
- **Tablet**: Two columns, optimized spacing
- **Desktop**: Three columns, full features

## 🎁 Bonus Features Included

Beyond your requirements, I have added:

1. **View Counter**: Track article popularity
2. **Recent Articles Widget**: On dashboard
3. **Popular Articles Ranking**: By views
4. **Visitor Analytics**: Track page visits
5. **Status Indicators**: Draft/Published/Scheduled badges
6. **Word Counter**: In article editor
7. **Preview Images**: Before upload
8. **Responsive Tables**: In admin dashboard
9. **Loading States**: For better UX
10. **Error Handling**: Graceful error messages

## 🚨 Important Notes

### Before Going Live

1. **Run Supabase SQL script** - Database must be set up
2. **Update .env.local** - Add your Supabase credentials
3. **Change admin password** - Use strong, unique password
4. **Get Gemini API key** - Required for AI features
5. **Test thoroughly** - Create, edit, delete articles
6. **Configure author info** - For about page

### Security Reminders

- Never commit `.env.local` to version control
- Change default admin credentials immediately
- Use strong passwords (12+ characters)
- Keep Gemini API key secure
- Monitor for suspicious activity

## 📞 Need Help?

Refer to these guides:
- `README.md` - Overview and features
- `SETUP_GUIDE.md` - Detailed setup instructions
- `DATABASE_SETUP.md` - Database configuration
- `DEPLOYMENT_GUIDE.md` - Production deployment
- `SUPABASE_SETUP.sql` - Ready-to-run SQL script

## ✨ You're All Set!

Your beautiful minimal blog is ready to use. Start by:
1. Setting up Supabase database
2. Configuring environment variables
3. Logging in to admin dashboard
4. Creating your first article with AI

**Enjoy your new blog platform!** 🎉

---

Built with ❤️ for twnty.ai