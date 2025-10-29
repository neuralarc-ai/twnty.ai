# ✅ Database Setup Verification

## New Supabase Database Configuration

**Project ID:** `ekguvsqvqjckdnoumyoi`  
**Region:** ap-southeast-1 (Singapore)  
**URL:** `https://ekguvsqvqjckdnoumyoi.supabase.co`  
**Status:** ✅ ACTIVE_HEALTHY

## Database Tables

Your database should have these tables:

1. ✅ **twnty_articles** - Blog articles with full content
2. ✅ **twnty_comments** - User comments on articles  
3. ✅ **twnty_settings** - App configuration (API keys, etc.)
4. ✅ **twnty_author** - Author profile information
5. ✅ **twnty_users** - Admin user accounts
6. ⚠️ **twnty_likes** - Article likes (needed for like functionality)
7. ⚠️ **twnty_visitors** - Visitor analytics (needed for dashboard stats)

## 🔧 Code Updates Applied

### 1. Fixed Table Name Constants in `lib/supabase.ts`

Updated the `TABLES` constant to match your database schema:

```typescript
export const TABLES = {
  ARTICLES: 'twnty_articles',
  COMMENTS: 'twnty_comments',     // ✅ Fixed: was 'comments'
  LIKES: 'twnty_likes',
  SETTINGS: 'twnty_settings',
  AUTHOR: 'twnty_author',
  VISITORS: 'twnty_visitors',      // ✅ Fixed: was 'visitors'
  ADMIN_USERS: 'twnty_users',      // ✅ Added: now points to correct table
};
```

### 2. Updated Users API Route

Modified `app/api/admin/users/route.ts` to:
- Import the `TABLES` constant
- Use `TABLES.ADMIN_USERS` instead of hardcoded `'admin_users'`

## ⚠️ Important: Verify Database Schema

Your database should have **twnty_users** table (not twnty_admin_users). Make sure it has this structure:

```sql
CREATE TABLE IF NOT EXISTS twnty_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔍 Missing Tables Check

The following tables are required for full functionality. Please verify they exist in your Supabase database:

### twnty_likes
```sql
CREATE TABLE IF NOT EXISTS twnty_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES tw tenants_articles(id) ON DELETE CASCADE,
  user_ip TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, user_ip)
);
```

### twnty_visitors
```sql
CREATE TABLE IF NOT EXISTS twnty_visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES twnty_articles(id) ON DELETE CASCADE,
  user_ip TEXT,
  user_agent TEXT,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## ✅ Next Steps

1. **Verify Environment Variables**: Ensure your `.env.local` has:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://ekguvsqvqjckdnoumyoi.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Create Missing Tables** (if needed): Run the SQL above in your Supabase SQL Editor

3. **Set Up Row Level Security (RLS)**: Make sure RLS policies are enabled for all tables

4. **Create Initial Admin User**: Use your preferred method to create the first admin account

5. **Test the Application**: 
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`

## 🔐 Security Note

- The current code uses plain text passwords (see line 29 in `app/api/admin/users/route.ts`)
- For production, implement proper password hashing with bcrypt or argon2
- The login currently uses environment variables, not the database users table

## 📊 Database Connection Test

To verify your database is working, check:
- Homepage loads articles from `twnty_articles`
- Admin dashboard at `/admin/dashboard`
- Comment system uses `twnty_comments`
- Settings page uses `twnty_settings`

---

**Date:** December 28, 2024  
**Status:** Code updated to match new database schema

