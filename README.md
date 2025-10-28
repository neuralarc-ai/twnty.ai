# twnty.ai - Minimal Blog Platform

A beautiful, minimal blog platform with AI-powered article generation, built with Next.js, Supabase, and Gemini AI.

## Features

### Public Blog
- ✨ Minimal black & white design
- 📱 Fully responsive layout
- 📖 Beautiful article reading experience
- ❤️ Like and comment functionality
- 🏷️ SEO-optimized with hashtags
- 👤 Author information page

### Admin Dashboard
- 📊 Analytics dashboard (articles, visitors, likes, comments)
- ✍️ Article management (create, edit, delete)
- 🤖 AI-powered article generation with Gemini 2.5 Pro
- 📅 Article scheduling
- 🎨 Media support (images, audio, video, external links)
- ⚙️ Settings management
- 👥 User management
- 📝 Author profile configuration

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a new Supabase project at https://supabase.com
2. Copy your project URL and anon key
3. Update `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_EMAIL=admin@twnty.ai
ADMIN_PASSWORD=changeme123
```

4. Run the database setup SQL from `DATABASE_SETUP.md` in your Supabase SQL Editor

### 3. Get Gemini API Key

1. Visit https://makersuite.google.com/app/apikey
2. Create a new API key
3. Add it in the admin Settings page after logging in

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see your blog!

### 5. Admin Access

- Admin Login: http://localhost:3000/admin/login
- Default credentials:
  - Email: admin@twnty.ai
  - Password: changeme123

**IMPORTANT**: Change these credentials in production!

## Project Structure

```
twnty-blog/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── article/[id]/page.tsx       # Article detail page
│   ├── about/page.tsx              # About page
│   ├── admin/
│   │   ├── login/page.tsx          # Admin login
│   │   ├── dashboard/page.tsx      # Admin dashboard
│   │   ├── articles/
│   │   │   ├── page.tsx            # Articles list
│   │   │   ├── new/page.tsx        # Create article
│   │   │   └── edit/[id]/page.tsx  # Edit article
│   │   └── settings/page.tsx       # Settings
│   └── api/
│       ├── like/route.ts           # Like API
│       ├── comments/route.ts       # Comments API
│       └── admin/                  # Admin APIs
├── components/
│   ├── Header.tsx                  # Public header
│   ├── Footer.tsx                  # Public footer
│   ├── AdminLayout.tsx             # Admin layout
│   ├── LikeButton.tsx              # Like button component
│   ├── CommentSection.tsx          # Comments component
│   └── DeleteArticleButton.tsx     # Delete button
├── lib/
│   ├── supabase.ts                 # Supabase client
│   ├── gemini.ts                   # Gemini AI integration
│   └── auth.ts                     # Auth helpers
└── types/
    └── index.ts                    # TypeScript types
```

## Usage Guide

### Creating Articles

1. Log in to admin dashboard
2. Click "New Article" or navigate to Articles → New Article
3. Either:
   - Write manually, or
   - Click the magic wand icon to generate with AI
4. Add images, media, links, and hashtags
5. Choose to save as draft, publish immediately, or schedule

### Managing Content

- **Dashboard**: View analytics and recent articles
- **Articles**: List, edit, or delete articles
- **Settings**: Configure Gemini API, manage users, update author info

### AI Article Generation

1. Ensure Gemini API key is configured in Settings
2. Click "Generate with AI" when creating/editing articles
3. Enter your topic or prompt
4. AI will generate a complete article (800+ words) with hashtags
5. Review and edit as needed before publishing

## Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Make sure to set all environment variables in your production environment:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- ADMIN_EMAIL
- ADMIN_PASSWORD
- SESSION_SECRET

## Security Notes

1. **Change default admin credentials** immediately
2. **Use proper password hashing** in production (bcrypt, argon2)
3. **Implement rate limiting** for API endpoints
4. **Add CSRF protection** for forms
5. **Use HTTPS** in production
6. **Secure your Gemini API key** (never expose in client-side code)

## Support

For issues or questions, contact the development team.

---

Built with ❤️ using Next.js, Supabase, and Gemini AI