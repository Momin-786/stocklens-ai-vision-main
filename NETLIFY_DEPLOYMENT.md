# Netlify Deployment Guide for StockLens

Complete step-by-step guide to deploy StockLens to Netlify.

## Prerequisites

- GitHub account with your code pushed to a repository
- Netlify account (free tier works)
- Supabase project set up

---

## Step 1: Create Netlify Account

1. Go to [https://app.netlify.com/](https://app.netlify.com/)
2. Click **Sign up** (or **Log in** if you already have an account)
3. Choose **Sign up with GitHub** (recommended for easy repository connection)
4. Authorize Netlify to access your GitHub account

---

## Step 2: Create a New Site

1. Once logged in, click **Add new site** → **Import an existing project**
2. Select **GitHub** as your Git provider
3. Authorize Netlify if prompted
4. Find and select your repository: `stocklens-ai-vision-main` (or your repo name)
5. Click **Import**

---

## Step 3: Configure Build Settings

Netlify should auto-detect your build settings, but verify:

1. **Build command:** `npm run build`
2. **Publish directory:** `dist`
3. **Base directory:** (leave empty, or set if your project is in a subfolder)

These settings are already configured in `netlify.toml`, so Netlify should pick them up automatically.

---

## Step 4: Add Environment Variables

**CRITICAL:** Add these environment variables before your first deployment.

1. In the Netlify setup page, scroll down to **Environment variables**
2. Click **Add variable** for each of the following:

### Required Environment Variables:

#### Variable 1: `VITE_SUPABASE_URL`
- **Key:** `VITE_SUPABASE_URL`
- **Value:** `https://your-project-id.supabase.co`
  - Replace `your-project-id` with your actual Supabase project ID
  - Example: `https://lvmumjsocfvxxxzrdhnq.supabase.co`
- **Scopes:** ✅ Production, ✅ Deploy previews, ✅ Branch deploys

#### Variable 2: `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Key:** `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Value:** Your Supabase anon/public key
  - Find it in: Supabase Dashboard → Settings → API → `anon` `public` key
  - It's a long string starting with `eyJ...`
- **Scopes:** ✅ Production, ✅ Deploy previews, ✅ Branch deploys

#### Variable 3: `VITE_SITE_URL` (Optional but Recommended)
- **Key:** `VITE_SITE_URL`
- **Value:** Your Netlify site URL (you'll get this after first deploy)
  - Format: `https://your-site-name.netlify.app`
  - Or use a custom domain if you have one
- **Scopes:** ✅ Production only

### How to Find Your Supabase Credentials:

1. Go to [https://app.supabase.com/](https://app.supabase.com/)
2. Select your project
3. Go to **Settings** → **API**
4. You'll see:
   - **Project URL** → Use this for `VITE_SUPABASE_URL`
   - **anon public** key → Use this for `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## Step 5: Deploy

1. After adding environment variables, click **Deploy site**
2. Wait for the build to complete (usually 2-5 minutes)
3. Once deployed, you'll get a URL like: `https://random-name-123.netlify.app`

---

## Step 6: Configure Supabase for Netlify

**IMPORTANT:** Supabase needs to know about your Netlify domain for authentication to work.

1. Go to [https://app.supabase.com/](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Set **Site URL** to your Netlify URL:
   - Example: `https://your-site-name.netlify.app`
   - ⚠️ **No trailing slash!**
5. Under **Redirect URLs**, add:
   - `https://your-site-name.netlify.app/**`
   - `https://your-site-name.netlify.app/*`
   - `https://your-site-name.netlify.app/`
6. Click **Save**

**Note:** If you have a custom domain, use that instead of the `.netlify.app` domain.

---

## Step 7: Update Environment Variables (If Needed)

If you set `VITE_SITE_URL` before deployment, update it with your actual Netlify URL:

1. Go to Netlify Dashboard → Your Site → **Site settings**
2. Go to **Environment variables**
3. Edit `VITE_SITE_URL` with your actual Netlify URL
4. Click **Save**
5. Go to **Deploys** tab → Click **Trigger deploy** → **Deploy site**

---

## Step 8: Test Your Deployment

1. Open your Netlify site URL
2. Try to sign up or sign in
3. Check browser console (F12) for any errors
4. If you see connection errors, verify:
   - Environment variables are set correctly
   - Supabase Site URL is configured
   - Supabase Redirect URLs include your Netlify domain

---

## Troubleshooting

### Build Fails

- Check build logs in Netlify Dashboard → Deploys → Click on failed deploy
- Common issues:
  - Missing dependencies → Check `package.json`
  - Build command error → Verify `npm run build` works locally
  - Environment variables not set → Add them in Site settings

### Authentication Doesn't Work

1. **Check Supabase Configuration:**
   - Site URL matches your Netlify URL exactly
   - Redirect URLs include your Netlify domain

2. **Check Environment Variables:**
   - Go to Netlify → Site settings → Environment variables
   - Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set
   - Make sure they're enabled for Production environment

3. **Redeploy:**
   - After changing environment variables, trigger a new deploy
   - Go to Deploys → Trigger deploy → Deploy site

### CORS Errors

- Verify Supabase Site URL is set to your Netlify URL
- Check that Redirect URLs include your Netlify domain
- Wait 1-2 minutes after changing Supabase settings for changes to propagate

---

## Environment Variables Summary

| Variable Name | Required | Description | Example |
|--------------|----------|-------------|---------|
| `VITE_SUPABASE_URL` | ✅ Yes | Your Supabase project URL | `https://lvmumjsocfvxxxzrdhnq.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅ Yes | Supabase anon/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_SITE_URL` | ⚠️ Optional | Your Netlify site URL | `https://your-site.netlify.app` |

---

## Custom Domain (Optional)

1. Go to Netlify Dashboard → Your Site → **Domain settings**
2. Click **Add custom domain**
3. Follow the instructions to configure DNS
4. Update Supabase Site URL and Redirect URLs to use your custom domain

---

## Continuous Deployment

Netlify automatically deploys when you push to your connected branch (usually `main` or `master`):

- **Production:** Deploys from your main branch
- **Preview:** Creates preview deployments for pull requests
- **Branch:** Deploys from other branches

All environment variables are available in all deployment types (unless you restrict them to specific scopes).

---

## Quick Checklist

- [ ] Netlify account created
- [ ] Repository connected to Netlify
- [ ] Build settings verified (`npm run build`, `dist`)
- [ ] `VITE_SUPABASE_URL` added to environment variables
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` added to environment variables
- [ ] `VITE_SITE_URL` added (optional)
- [ ] Site deployed successfully
- [ ] Supabase Site URL configured to Netlify URL
- [ ] Supabase Redirect URLs include Netlify domain
- [ ] Tested sign up/sign in functionality

---

## Need Help?

- **Netlify Docs:** [https://docs.netlify.com/](https://docs.netlify.com/)
- **Supabase Docs:** [https://supabase.com/docs](https://supabase.com/docs)
- **Netlify Support:** [https://www.netlify.com/support/](https://www.netlify.com/support/)

