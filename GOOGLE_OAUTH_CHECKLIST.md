# Google OAuth Setup Checklist for lenstock.netlify.app

Use this checklist to ensure everything is configured correctly.

## ✅ Google Cloud Console Setup

### Step 1: Create OAuth Client
- [ ] Go to https://console.cloud.google.com/
- [ ] Create or select a project
- [ ] Configure OAuth consent screen (External)
- [ ] Create OAuth client ID (Web application)

### Step 2: Add Redirect URIs
Add these **exact** URLs in Google Cloud Console → OAuth Client → Authorized redirect URIs:

- [ ] `http://localhost:5173/auth/callback`
- [ ] `https://lenstock.netlify.app/auth/callback`
- [ ] `https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`
  - *Replace YOUR_SUPABASE_PROJECT_REF with your actual Supabase project reference*
  - *Find it in your `.env` file as `VITE_SUPABASE_URL` or in Supabase Dashboard*

### Step 3: Get Credentials
- [ ] Copy **Client ID** (starts with numbers, ends with `.apps.googleusercontent.com`)
- [ ] Copy **Client Secret** (starts with `GOCSPX-`)
- [ ] Save them securely (you can't see the secret again!)

## ✅ Supabase Dashboard Setup

### Step 4: Enable Google Provider
- [ ] Go to https://app.supabase.com/
- [ ] Select your project
- [ ] Go to **Authentication** → **Providers**
- [ ] Find **Google** and toggle it **ON**
- [ ] Click **Configure**
- [ ] Paste your **Client ID** from Google Cloud Console
- [ ] Paste your **Client Secret** from Google Cloud Console
- [ ] Click **Save**

### Step 5: Configure Redirect URLs
- [ ] Go to **Authentication** → **URL Configuration**
- [ ] Click **Add URL** and add: `http://localhost:5173/auth/callback`
- [ ] Click **Add URL** and add: `https://lenstock.netlify.app/auth/callback`
- [ ] Click **Add URL** and add: `https://lenstock.netlify.app/**`
- [ ] Click **Save** after each addition

### Step 6: Set Site URL
- [ ] In **URL Configuration**, set **Site URL** to: `https://lenstock.netlify.app`
- [ ] Click **Save**

## ✅ Netlify Environment Variables

### Step 7: Verify Netlify Settings
- [ ] Go to Netlify Dashboard → Your Site → Site Settings → Environment Variables
- [ ] Verify `VITE_SUPABASE_URL` is set (your Supabase project URL)
- [ ] Verify `VITE_SUPABASE_PUBLISHABLE_KEY` is set (your Supabase anon key)
- [ ] (Optional) Add `VITE_SITE_URL` = `https://lenstock.netlify.app`
- [ ] If you changed any variables, trigger a new deployment

## ✅ Testing

### Step 8: Test Local Development
- [ ] Start dev server: `npm run dev`
- [ ] Go to http://localhost:5173/auth
- [ ] Click "Continue with Google"
- [ ] Complete OAuth flow
- [ ] Should redirect to `/stocks` after login

### Step 9: Test Production
- [ ] Go to https://lenstock.netlify.app/auth
- [ ] Click "Continue with Google" or "Start with Google"
- [ ] Complete OAuth flow
- [ ] Should redirect back to your site and log you in
- [ ] Check browser console (F12) for any errors

## 🔍 Quick Verification

### All URLs to Check:

**In Google Cloud Console:**
- ✅ `http://localhost:5173/auth/callback`
- ✅ `https://lenstock.netlify.app/auth/callback`
- ✅ `https://YOUR_SUPABASE_REF.supabase.co/auth/v1/callback`

**In Supabase Dashboard:**
- ✅ `http://localhost:5173/auth/callback`
- ✅ `https://lenstock.netlify.app/auth/callback`
- ✅ `https://lenstock.netlify.app/**`
- ✅ Site URL: `https://lenstock.netlify.app`

## 🐛 Common Issues

### "Redirect URI mismatch"
- Check that URLs match EXACTLY (including https, no trailing slashes)
- Verify in both Google Cloud Console AND Supabase

### "Provider not enabled"
- Make sure Google provider is toggled ON in Supabase
- Verify Client ID and Secret are pasted correctly (no extra spaces)

### OAuth works locally but not on Netlify
- Check Netlify environment variables are set
- Verify Site URL in Supabase is `https://lenstock.netlify.app`
- Make sure all redirect URLs are added in both places

## 📝 Notes

- Your production site: **https://lenstock.netlify.app**
- Make sure to add the Supabase redirect URI - it's required for OAuth to work
- The Supabase redirect URI format: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- All redirect URIs must match exactly (case-sensitive, no trailing slashes)

## 📚 Reference Guides

- Quick guide: `GOOGLE_OAUTH_QUICK_GUIDE.md`
- Detailed guide: `GOOGLE_OAUTH_SETUP.md`

