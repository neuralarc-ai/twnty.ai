# 🚀 Pre-Deployment Checklist

## ❌ CRITICAL ISSUE: File Uploads

**Your current file upload implementation won't work on Vercel!**

The upload API (`app/api/admin/upload/route.ts`) writes files to the filesystem, which doesn't work on serverless platforms like Vercel because:
- Serverless functions have read-only filesystem
- Files disappear after function completes
- Deployments don't preserve uploaded files

### Solutions (Choose One):

#### Option 1: Use Supabase Storage (Recommended)
1. Enable Supabase Storage in your project
2. Create a bucket named `uploads`
3. Replace file upload logic to use Supabase Storage API
4. Images will be served from Supabase CDN

#### Option 2: Use Vercel Blob Storage (Paid)
1. Install `@vercel/blob`
2. Update upload route to use Vercel Blob
3. Simple integration, requires Vercel Pro plan

#### Option 3: Use Cloudinary (Free tier available)
1. Sign up for free Cloudinary account
2. Update upload route to use Cloudinary API
3. Generous free tier for images

### Quick Supabase Storage Fix:
```typescript
// app/api/admin/upload/route.ts - Replace with:
import { supabase } from '@/lib/supabase';

const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);
const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

const { data, error } = await supabase.storage
  .from('uploads')
  .upload(filename, buffer);

if (error) throw error;

const { data: { publicUrl } } = supabase.storage
  .from('uploads')
  .getPublicUrl(filename);

return NextResponse.json({ url: publicUrl });
```

---

## ✅ Environment Variables in Vercel

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables (Production, Preview, and Development):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
ADMIN_EMAIL=admin@twnty.ai
ADMIN_PASSWORD=changeme123  ← CHANGE THIS!
SESSION_SECRET=generate-random-string-here  ← CHANGE THIS!
CRON_SECRET=generate-random-secret-here  ← CHANGE THIS!
```

**Generate secure secrets:**
```bash
openssl rand -base64 32  # For SESSION_SECRET
openssl rand -base64 32  # For CRON_SECRET
```

---

## ✅ DNS Configuration

Verify DNS records at your domain registrar:

**For twnty.ai:**
- Type: `A` or `ALIAS`
- Name: `@`
- Value: Vercel IP (check Vercel domain settings)

**For www.twnty.ai:**
- Type: `CNAME`
- Name: `www`
- Value: Vercel domain (e.g., `twnty-ai.vercel.app`)

**For admin.twnty.ai:**
- Type: `CNAME`
- Name: `admin`
- Value: Vercel domain (e.g., `twnty-ai.vercel.app`)

---

## ✅ Domain SSL (Automatic)

Vercel automatically provisions SSL certificates for all domains. Just wait 1-5 minutes after adding domains.

Verify:
- All domains show green lock (🔒) in browser
- No "Not Secure" warnings
- Certificates are valid

---

## ✅ Supabase Configuration

1. **RLS Policies**: Ensure proper Row Level Security policies
2. **CORS Settings**: Allow your production domain
   - Go to Supabase Dashboard → Settings → API
   - Add to allowed origins: `https://twnty.ai`, `https://admin.twnty.ai`
3. **Storage Bucket**: Create `uploads` bucket if using Supabase Storage

---

## ✅ Database Setup

Run `SUPABASE_SETUP.sql` in Supabase SQL Editor if not already done:
- Creates all required tables
- Sets up proper indexes
- Configures relationships

---

## ✅ Test Deploy

Before going live:

1. **Test public site:**
   - Visit https://twnty.ai
   - Check homepage loads
   - Check article pages
   - Check search
   - Check about page

2. **Test admin:**
   - Visit https://admin.twnty.ai
   - Should redirect to login
   - Test login with credentials
   - Test creating article
   - ⚠️ **Note**: File uploads won't work until fixed

3. **Test subdomain:**
   - https://www.twnty.ai → redirects to https://twnty.ai
   - https://twnty.ai/admin → redirects to https://twnty.ai

4. **Test API:**
   - Check API routes work
   - Test comments
   - Test likes
   - Test search

---

## ✅ Performance Optimization

Already optimized in code:
- ✅ Next.js Image optimization
- ✅ Static page generation
- ✅ Middleware caching
- ✅ Responsive images
- ✅ Code splitting

---

## ✅ Security Checklist

- [ ] Changed default admin password
- [ ] Generated secure SESSION_SECRET
- [ ] Generated secure CRON_SECRET
- [ ] Environment variables set in Vercel
- [ ] No secrets in code (already done ✅)
- [ ] HTTPS enabled (automatic with Vercel ✅)
- [ ] Admin link removed from footer (already done ✅)
- [ ] Subdomain isolation working (middleware ✅)

---

## ✅ Monitoring & Analytics

Optional but recommended:

1. **Vercel Analytics**: Enable in Vercel dashboard
2. **Error Tracking**: Consider Sentry or similar
3. **Uptime Monitoring**: UptimeRobot or Pingdom

---

## ⚠️ Known Issues

1. **File Uploads**: Won't work until migrated to cloud storage
2. **Image URLs**: May be broken if referring to `/uploads/` paths
3. **Build Warnings**: Dynamic server usage warnings are normal (can be ignored)

---

## 🚨 After Deployment

1. **First Login**: Change admin password immediately
2. **Check Logs**: Monitor Vercel function logs for errors
3. **Test Everything**: Thoroughly test all features
4. **Monitor**: Watch for errors in browser console
5. **Fix Uploads**: Implement cloud storage solution ASAP

---

## 📞 Troubleshooting

**Build fails:**
- Check environment variables are set
- Check for syntax errors in code
- Review build logs in Vercel

**SSL not working:**
- Wait 5-10 minutes for certificate provisioning
- Check DNS propagation complete
- Clear browser cache

**404 errors:**
- Check middleware logic
- Verify routes exist
- Check Next.js build output

**Database errors:**
- Verify Supabase environment variables
- Check database tables exist
- Review Supabase logs

---

**Need help?** Review the error logs in Vercel dashboard under the "Logs" tab.

