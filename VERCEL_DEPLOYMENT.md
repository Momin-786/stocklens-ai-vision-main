# Vercel Deployment Guide for StockLens

This guide will help you fix the Supabase authentication error when deploying to Vercel.

## Problem

When deploying to Vercel, you may encounter an error like:
```
Request URL: https://your-project.supabase.co/auth/v1/signup?redirect_to=https://your-app.vercel.app/
```

This happens because Supabase requires redirect URLs to be whitelisted in the authentication settings.

## Solution

### Step 1: Configure Supabase URL Configuration (CRITICAL FOR CORS)

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**

4. **MOST IMPORTANT - Set Site URL:**
   - Under **Site URL**, set it to your production Vercel URL:
   - `https://stocklens-ai-vision-main.vercel.app`
   - ⚠️ **This is required for CORS to work!** Without this, you'll get CORS errors.

5. Under **Redirect URLs**, add your Vercel deployment URLs:
   - `https://stocklens-ai-vision-main.vercel.app/**`
   - `https://stocklens-ai-vision-main.vercel.app/*`
   - `https://stocklens-ai-vision-main.vercel.app/`
   
   If you have multiple environments (production, preview), add:
   - `https://*.vercel.app/**` (for preview deployments)
   - Your specific production URL

**Note:** The Site URL is the primary setting that controls CORS. Make sure it matches your Vercel deployment URL exactly.

### Step 2: Configure Vercel Environment Variables

In your Vercel project settings, add these environment variables:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_SITE_URL=https://your-app.vercel.app
```

**Important:**
- Replace `your-project` with your actual Supabase project reference
- Replace `your-anon-key-here` with your Supabase anon/public key
- Replace `your-app.vercel.app` with your actual Vercel deployment URL
- Make sure to add these for **Production**, **Preview**, and **Development** environments

### Step 3: Redeploy

After configuring the environment variables:

1. Go to your Vercel project
2. Click **Deployments**
3. Click the three dots (⋯) on the latest deployment
4. Select **Redeploy**

Or push a new commit to trigger a new deployment.

### Step 4: Verify Configuration

1. Visit your Vercel deployment
2. Try to sign up or sign in
3. Check the browser console for any errors
4. If errors persist, verify:
   - Environment variables are set correctly in Vercel
   - Redirect URLs are whitelisted in Supabase
   - The Site URL matches your Vercel deployment URL

## Additional Configuration

### For Preview Deployments

If you want preview deployments (from pull requests) to work:

1. In Supabase, add `https://*.vercel.app/**` to Redirect URLs
2. In Vercel, the environment variables will automatically be available to preview deployments

### For Local Development

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_SITE_URL=http://localhost:8080
```

## Troubleshooting

### Error: "redirect_to URL is not allowed"

- **Solution:** Make sure your Vercel URL is added to Supabase Redirect URLs
- Check that the URL format matches exactly (with or without trailing slash)

### Error: "Invalid API key"

- **Solution:** Verify your `VITE_SUPABASE_PUBLISHABLE_KEY` is correct in Vercel
- Make sure you're using the **anon/public** key, not the service role key

### Error: "ERR_CONNECTION_RESET" or "Failed to fetch"

This error indicates the connection to Supabase is being reset. Common causes:

1. **Missing Environment Variables:**
   - Check Vercel environment variables are set correctly
   - Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are present
   - Make sure they're set for the correct environment (Production/Preview)

2. **Incorrect Supabase URL:**
   - Verify the URL format: `https://your-project.supabase.co`
   - Make sure there's no trailing slash
   - Check the URL in Supabase Dashboard → Settings → API

3. **Supabase Project Issues:**
   - Check if your Supabase project is paused (free tier projects pause after inactivity)
   - Verify the project is active in Supabase Dashboard
   - Check if you've exceeded rate limits

4. **Network/Firewall Issues:**
   - Some networks block connections to Supabase
   - Try accessing from a different network
   - Check browser console for detailed error messages

5. **CORS Issues:**
   - Supabase should handle CORS automatically
   - If issues persist, check Supabase Dashboard → Settings → API → CORS settings

### Error: "Access to fetch has been blocked by CORS policy"

This is a **critical configuration issue** that must be fixed in Supabase Dashboard:

**Solution - Configure Supabase Site URL:**

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project: `lvmumjsocfvxxxzrdhnq`
3. Navigate to **Authentication** → **URL Configuration**
4. **CRITICAL:** Set the **Site URL** to:
   ```
   https://stocklens-ai-vision-main.vercel.app
   ```
   This is the most important setting for CORS!

5. Under **Redirect URLs**, ensure you have:
   ```
   https://stocklens-ai-vision-main.vercel.app/**
   https://stocklens-ai-vision-main.vercel.app/*
   https://stocklens-ai-vision-main.vercel.app/
   ```

6. **Additional CORS Configuration** (if Site URL doesn't fix it):
   - Go to **Settings** → **API**
   - Check if there are any CORS restrictions
   - For most cases, Supabase handles CORS automatically when Site URL is set correctly

**Why this happens:**
- Supabase uses the Site URL to determine which origins are allowed for CORS
- If Site URL is not set or is incorrect, Supabase will block requests from your Vercel domain
- This is a security feature to prevent unauthorized domains from accessing your Supabase project

**Verification:**
After setting the Site URL:
1. Wait 1-2 minutes for changes to propagate
2. Clear your browser cache or use incognito mode
3. Try signing up again
4. Check browser console - CORS error should be gone

**Debugging Steps:**
1. Open browser DevTools → Console
2. Check for detailed error messages
3. Verify environment variables in Vercel build logs
4. Test Supabase connection directly: `https://your-project.supabase.co/rest/v1/` (should return JSON)

### Authentication works locally but not on Vercel

- **Solution:** 
  1. Check Vercel environment variables are set
  2. Verify the variables are available in the build (check Vercel build logs)
  3. Ensure Supabase Redirect URLs include your Vercel domain
  4. Make sure environment variables are set for **Production** environment in Vercel

## Security Notes

- Never commit `.env` files with secrets to git
- Use Vercel's environment variables for production secrets
- The `VITE_SUPABASE_PUBLISHABLE_KEY` is safe to expose (it's designed to be public)
- Keep your Supabase service role key secret and never expose it in client-side code

## Need Help?

If you're still experiencing issues:

1. Check the browser console for detailed error messages
2. Check Vercel build logs for environment variable issues
3. Verify Supabase project settings match your deployment URL
4. Ensure all environment variables are set for the correct environment (Production/Preview/Development)

