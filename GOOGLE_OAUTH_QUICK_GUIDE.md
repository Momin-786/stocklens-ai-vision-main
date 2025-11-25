# Quick Guide: Getting Google OAuth Credentials

## Direct Links
- **Google Cloud Console**: https://console.cloud.google.com/
- **Supabase Dashboard**: https://app.supabase.com/

## Quick Steps (5 minutes)

### 1. Go to Google Cloud Console
👉 https://console.cloud.google.com/

### 2. Create/Select Project
- Click project dropdown (top left)
- Click "New Project" or select existing
- Name it (e.g., "StockLens OAuth")

### 3. Configure OAuth Consent Screen
- Left sidebar: **APIs & Services** → **OAuth consent screen**
- Choose **External** → Click **Create**
- Fill in:
  - App name: "StockLens" (or your app name)
  - User support email: Your email
  - Developer contact: Your email
- Click **Save and Continue** through all steps

### 4. Create OAuth Credentials
- Left sidebar: **APIs & Services** → **Credentials**
- Click **+ CREATE CREDENTIALS** → **OAuth client ID**
- Application type: **Web application**
- Name: "StockLens Web Client"

### 5. Add Redirect URIs
Click **+ ADD URI** and add these (one at a time):

**1. For Local Development:**
```
http://localhost:5173/auth/callback
```

**2. For Your Netlify Production Site:**
```
https://lenstock.netlify.app/auth/callback
```

**3. For Supabase (find your project ref in Supabase Dashboard):**
```
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```
*Example: If your Supabase URL is `https://lvmumjsocfvxxxzrdhnq.supabase.co`, use:*
```
https://lvmumjsocfvxxxzrdhnq.supabase.co/auth/v1/callback
```

**Important:** Add ALL three URLs above. The Supabase one is required for the OAuth flow to work.

### 6. Get Your Credentials
- Click **CREATE**
- **Copy Client ID** (looks like: `123456789-abc...apps.googleusercontent.com`)
- **Copy Client Secret** (looks like: `GOCSPX-abc...`)
- ⚠️ **Save these immediately** - you can't see the secret again!

### 7. Add to Supabase
1. Go to https://app.supabase.com/
2. Select your project
3. **Authentication** → **Providers** → **Google**
4. Toggle **ON**
5. Paste **Client ID** and **Client Secret**
6. Click **Save**

### 8. Configure Supabase Redirect URLs
1. **Authentication** → **URL Configuration**
2. Add to **Redirect URLs** (click "Add URL" for each):
   - `http://localhost:5173/auth/callback` (for local development)
   - `https://lenstock.netlify.app/auth/callback` (for your Netlify site)
   - `https://lenstock.netlify.app/**` (wildcard for all routes on your site)
3. Set **Site URL** to: `https://lenstock.netlify.app`

## Finding Your Supabase Project Reference

1. Go to Supabase Dashboard
2. Look at your project URL in the browser
3. It looks like: `https://app.supabase.com/project/XXXXX`
4. Or check your Supabase URL: `https://XXXXX.supabase.co`
5. The `XXXXX` part is your project reference

## Common Issues

### "Can't find OAuth consent screen"
- Make sure you completed Step 3 above
- You must configure the consent screen before creating credentials

### "Redirect URI mismatch"
- Check that ALL redirect URIs are added in Google Cloud Console
- Make sure they match EXACTLY (including http vs https, trailing slashes, etc.)

### "Invalid client secret"
- Make sure you copied the entire Client Secret
- It should start with `GOCSPX-`
- If you lost it, you'll need to create new credentials

## Visual Guide Locations

In Google Cloud Console, you'll find:
- **OAuth consent screen**: Left sidebar → APIs & Services → OAuth consent screen
- **Credentials**: Left sidebar → APIs & Services → Credentials
- **Create OAuth client ID**: Click "+ CREATE CREDENTIALS" button → "OAuth client ID"

## Need Help?

If you get stuck:
1. Check the detailed guide in `GOOGLE_OAUTH_SETUP.md`
2. Verify all redirect URIs are added correctly
3. Make sure OAuth consent screen is configured
4. Check that credentials are pasted correctly in Supabase (no extra spaces)

