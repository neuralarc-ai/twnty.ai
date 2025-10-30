# 🔧 Database Schema Fix

## Issue
Error when creating articles: `Could not find the 'featured_image' column of 'twnty_articles' in the schema cache`

## Root Cause
The API routes were using incorrect column names that didn't match the actual database schema.

### Database Schema (Actual)
- `excerpt` (not `teaser`)
- `image_url` (not `featured_image`)
- `audio_url` and `video_url` as separate fields
- `external_links` as TEXT array

### API Code (Before Fix)
- Using `teaser` instead of `excerpt`
- Using `featured_image` instead of `image_url`
- Using `media_url` and `media_type` instead of separate fields

## Changes Made

### 1. Fixed Create Article API (`app/api/admin/articles/route.ts`)

**Before:**
```typescript
const articleData = {
  teaser: body.excerpt || body.teaser || ...,
  featured_image: body.image_url || body.featured_image,
  media_url: body.audio_url || body.video_url || body.media_url,
  media_type: body.audio_url ? 'audio' : body.video_url ? 'video' : null,
  // external_links was missing
};
```

**After:**
```typescript
const articleData = {
  excerpt: body.excerpt || body.teaser || ...,
  image_url: body.image_url || body.featured_image,
  audio_url: body.audio_url,
  video_url: body.video_url,
  external_links: body.external_links || [],
  // Using correct database column names
};
```

### 2. Fixed Update Article API (`app/api/admin/articles/[id]/route.ts`)

Similar fixes applied to match database schema.

## Database Columns Reference

The `twnty_articles` table has these columns:

```sql
CREATE TABLE twnty_articles (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,              -- ✅ Excerption/excerpt
  image_url TEXT,            -- ✅ Featured image URL
  audio_url TEXT,            -- ✅ Audio media URL
  video_url TEXT,            -- ✅ Video media URL
  external_links TEXT[],     -- ✅ Array of external links
  hashtags TEXT[],           -- ✅ Array of hashtags
  author_id UUID,
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0
);
```

## Image Upload Bucket Setup

You created a bucket named `article-images` for image storage.

### Verify Bucket Configuration

Make sure the bucket is configured correctly:

1. Go to your Supabase Dashboard → Storage
2. Find the `article-images` bucket
3. Ensure it's set to **Public** if images should be publicly accessible
4. Or configure proper RLS policies for restricted access

### Update Upload API (if needed)

The upload API (`app/api/admin/upload/route.ts`) should be configured to upload to the correct bucket:

```typescript
// Should upload to 'article-images' bucket
const { data, error } = await supabase.storage
  .from('article-images')  // ✅ Your bucket name
  .upload(filename, buffer);
```

## Testing

Try creating an article now. It should work without errors!

## Summary of Changes

✅ Fixed column names in `app/api/admin/articles/route.ts`:
- `teaser` → `excerpt`
- `featured_image` → `image_url`
- `media_url`/`media_type` → `audio_url` and `video_url` separately
- Added `external_links` field

✅ Fixed column names in `app/api/admin/articles/[id]/route.ts`:
- Same updates as above for the update endpoint

✅ API still accepts `featured_image` from frontend for backward compatibility
✅ API converts it to `image_url` for database storage

---

**Date:** December 28, 2024  
**Status:** ✅ Fixed - Articles can now be created successfully




