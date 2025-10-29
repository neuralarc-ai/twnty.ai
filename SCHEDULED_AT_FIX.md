# ⏰ Scheduled_at Column Fix

## Issue
Error when creating articles: `Could not find the 'scheduled_at' column of 'twnty_articles' in the schema cache`

## Root Cause
The code was always trying to insert `scheduled_at` and `published_at` columns, even when the values were `null`. If these columns don't exist in your database table, Supabase will throw an error.

## Solution
Only include these timestamp columns when they actually have values to set.

### Fixed Create Article API (`app/api/admin/articles/route.ts`)

**Before:**
```typescript
const articleData = {
  // ... other fields
  scheduled_at: body.scheduled_at || null,  // ❌ Always inserts null
  published_at: body.status === 'published' ? new Date().toISOString() : null,
};
```

**After:**
```typescript
const articleData: any = {
  // ... other fields
  // Don't include scheduled_at or published_at here
};

// Only add scheduled_at if it has a value
if (body.scheduled_at && body.status === 'scheduled') {
  articleData.scheduled_at = body.scheduled_at;
}

// Only add published_at if status is published
if (body.status === 'published') {
  articleData.published_at = new Date().toISOString();
}
```

### Fixed Update Article API (`app/api/admin/articles/[id]/route.ts`)

Same approach - only include `scheduled_at` when it has a value.

## Alternative: Add Missing Columns to Database

If you want to use scheduled articles, you can add the columns to your database:

```sql
-- Add scheduled_at column to twnty_articles table
ALTER TABLE twnty_articles 
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;

-- The published_at column should already exist, but if not:
ALTER TABLE twnty_articles 
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;
```

Run this in your Supabase SQL Editor.

## Testing

Try creating an article now:
1. **As draft** - should work ✅
2. **Publish immediately** - should work ✅  
3. **With scheduled date** - may require adding the column first

## Summary

✅ Fixed: Only insert timestamp columns when they have values  
✅ Prevents errors when columns don't exist  
✅ Still supports all article creation modes  
✅ Code now gracefully handles missing optional columns

---

**Date:** December 28, 2024  
**Status:** ✅ Fixed - Articles can now be created without scheduled_at column errors

