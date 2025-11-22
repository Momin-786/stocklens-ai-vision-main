# Quick Fix: CORS Error on Vercel Deployment

## Error Message
```
Access to fetch at 'https://lvmumjsocfvxxxzrdhnq.supabase.co/auth/v1/signup' 
from origin 'https://stocklens-ai-vision-main.vercel.app' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

## Quick Fix (2 minutes)

### Step 1: Open Supabase Dashboard
1. Go to https://app.supabase.com/
2. Select your project: **lvmumjsocfvxxxzrdhnq**

### Step 2: Configure Site URL (CRITICAL)
1. Click **Authentication** in the left sidebar
2. Click **URL Configuration**
3. Find **Site URL** field
4. Set it to: `https://stocklens-ai-vision-main.vercel.app`
5. Click **Save**

### Step 3: Configure Redirect URLs
1. In the same **URL Configuration** page
2. Under **Redirect URLs**, click **Add URL**
3. Add these URLs (one at a time):
   - `https://stocklens-ai-vision-main.vercel.app/**`
   - `https://stocklens-ai-vision-main.vercel.app/*`
   - `https://stocklens-ai-vision-main.vercel.app/`
4. Click **Save** after each one

### Step 4: Wait and Test
1. Wait 1-2 minutes for changes to propagate
2. Clear browser cache or use incognito mode
3. Try signing up again
4. CORS error should be resolved!

## Why This Happens

Supabase uses the **Site URL** to determine which domains are allowed to make requests. If it's not set or is incorrect, Supabase blocks requests from your Vercel domain for security reasons.

## Verification

After setting the Site URL, you can verify it's working:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to sign up
4. Check the request to `/auth/v1/signup`
5. Response headers should include: `Access-Control-Allow-Origin: https://stocklens-ai-vision-main.vercel.app`

## Still Not Working?

1. **Double-check the Site URL** - It must match your Vercel URL exactly (no trailing slash)
2. **Check Vercel environment variables** - Ensure `VITE_SUPABASE_URL` is set correctly
3. **Wait longer** - Sometimes changes take 2-3 minutes to propagate
4. **Try a different browser** - Clear cache completely
5. **Check Supabase project status** - Make sure it's not paused

## For Preview Deployments

If you have preview deployments (from pull requests), also add:
- `https://*.vercel.app/**` to Redirect URLs

This allows all Vercel preview deployments to work.

