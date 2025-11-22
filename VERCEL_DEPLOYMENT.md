# Vercel Deployment Guide for StockLens

This guide will help you fix the Supabase authentication error when deploying to Vercel.

## Problem

When deploying to Vercel, you may encounter an error like:
```
Request URL: https://your-project.supabase.co/auth/v1/signup?redirect_to=https://your-app.vercel.app/
```

This happens because Supabase requires redirect URLs to be whitelisted in the authentication settings.

## Solution

### Step 1: Configure Supabase Redirect URLs

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Under **Redirect URLs**, add your Vercel deployment URLs:
   - `https://your-app.vercel.app/**`
   - `https://your-app.vercel.app/*`
   - `https://your-app.vercel.app/`
   
   If you have multiple environments (production, preview), add:
   - `https://*.vercel.app/**` (for preview deployments)
   - Your specific production URL

5. Under **Site URL**, set it to your production Vercel URL:
   - `https://your-app.vercel.app`

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

### Authentication works locally but not on Vercel

- **Solution:** 
  1. Check Vercel environment variables are set
  2. Verify the variables are available in the build (check Vercel build logs)
  3. Ensure Supabase Redirect URLs include your Vercel domain

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

