# Google OAuth Setup Guide

## Implementation Complete ✅

Google OAuth login has been successfully integrated into the application. The following features have been added:

### Features Added:
1. **"Continue with Google" button** on the Sign In tab
2. **"Start with Google" button** on the Sign Up tab
3. **OAuth callback handler** at `/auth/callback` route
4. **Automatic session detection** and redirect after successful Google login
5. **Error handling** for OAuth failures

### Files Modified:
- `src/pages/Auth.tsx` - Added Google OAuth buttons and handler
- `src/pages/AuthCallback.tsx` - New callback handler component
- `src/App.tsx` - Added `/auth/callback` route

## Supabase Configuration Required

To enable Google OAuth, you need to configure it in your Supabase dashboard:

### Step 1: Enable Google Provider
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list
5. Toggle it **ON**
6. Click **Configure**

### Step 2: Get Google OAuth Credentials from Google Cloud Console

Follow these detailed steps to obtain your Client ID and Client Secret:

#### Step 2.1: Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

#### Step 2.2: Create or Select a Project
1. Click the project dropdown at the top of the page (next to "Google Cloud")
2. Either:
   - **Select an existing project** (if you have one), OR
   - **Click "New Project"** to create a new one
3. If creating new:
   - Enter a project name (e.g., "StockLens OAuth")
   - Click "Create"
   - Wait for the project to be created (may take a few seconds)

#### Step 2.3: Configure OAuth Consent Screen
1. In the left sidebar, go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace account, then choose Internal)
3. Click **Create**
4. Fill in the required information:
   - **App name**: Your app name (e.g., "StockLens")
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
5. Click **Save and Continue**
6. On the **Scopes** page, click **Save and Continue** (no need to add scopes for basic login)
7. On the **Test users** page (if External), you can add test users or click **Save and Continue**
8. Review and click **Back to Dashboard**

#### Step 2.4: Create OAuth Credentials
1. In the left sidebar, go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** at the top
3. Select **OAuth client ID**
4. If prompted, configure the OAuth consent screen (you should have done this in Step 2.3)
5. In the **Application type** dropdown, select **Web application**
6. Give it a name (e.g., "StockLens Web Client")

#### Step 2.5: Configure Authorized Redirect URIs
In the **Authorized redirect URIs** section, click **+ ADD URI** and add these URLs (add all three):

**1. For Local Development:**
```
http://localhost:5173/auth/callback
```

**2. For Your Netlify Production Site:**
```
https://lenstock.netlify.app/auth/callback
```

**3. For Supabase (replace YOUR_PROJECT_REF with your Supabase project reference):**
```
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

**To find your Supabase project reference:**
- Go to your Supabase Dashboard
- Look at your Supabase URL: `https://YOUR_PROJECT_REF.supabase.co`
- The part before `.supabase.co` is your project reference
- Or check your `.env` file for `VITE_SUPABASE_URL`

**Example:**
If your Supabase URL is `https://lvmumjsocfvxxxzrdhnq.supabase.co`, then add:
```
https://lvmumjsocfvxxxzrdhnq.supabase.co/auth/v1/callback
```

**⚠️ Important:** You must add ALL three URLs above. The Supabase redirect URI is required for the OAuth flow to complete successfully.

#### Step 2.6: Get Your Credentials
1. After adding all redirect URIs, click **CREATE**
2. A popup will appear with your credentials:
   - **Your Client ID**: A long string like `123456789-abcdefghijklmnop.apps.googleusercontent.com`
   - **Your Client Secret**: A string like `GOCSPX-abcdefghijklmnopqrstuvwxyz`
3. **IMPORTANT**: Copy both values immediately - you won't be able to see the Client Secret again!
   - You can copy them to a temporary text file
   - Or keep the popup open while you configure Supabase

#### Step 2.7: (Optional) Download Credentials
1. You can click **DOWNLOAD JSON** to save the credentials to a file
2. Keep this file secure and never commit it to version control

### Step 3: Add Credentials to Supabase
1. Back in Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Paste your **Client ID** and **Client Secret**
3. Click **Save**

### Step 4: Configure Redirect URLs in Supabase
1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. Click **Add URL** and add these redirect URLs (one at a time):
   - `http://localhost:5173/auth/callback` (for local development)
   - `https://lenstock.netlify.app/auth/callback` (for your Netlify production site)
   - `https://lenstock.netlify.app/**` (wildcard for all routes on your site)
3. Click **Save** after adding each URL

### Step 5: Set Site URL in Supabase
1. In the same **URL Configuration** page
2. Set **Site URL** to: `https://lenstock.netlify.app`
   - This is your production domain
   - For local development, you can temporarily change this to `http://localhost:5173` when testing locally

## Testing

### Local Development:
1. Make sure your `.env.local` has:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
   VITE_SITE_URL=http://localhost:5173
   ```

2. Start your dev server:
   ```bash
   npm run dev
   ```

3. Navigate to `/auth` and click "Continue with Google" or "Start with Google"

### Production (Netlify):
1. **Verify Netlify Environment Variables:**
   - Go to Netlify Dashboard → Your Site → Site Settings → Environment Variables
   - Ensure these are set:
     - `VITE_SUPABASE_URL` = Your Supabase project URL
     - `VITE_SUPABASE_PUBLISHABLE_KEY` = Your Supabase anon/public key
     - `VITE_SITE_URL` = `https://lenstock.netlify.app` (optional, but recommended)
   - If you added/changed variables, trigger a new deployment

2. **Test the Google login flow:**
   - Visit: https://lenstock.netlify.app/auth
   - Click "Continue with Google" or "Start with Google"
   - Complete the OAuth flow
   - You should be redirected back to your site and logged in

3. **If it doesn't work:**
   - Check browser console for errors (F12 → Console tab)
   - Verify all redirect URLs are added in both Google Cloud Console and Supabase
   - Make sure Site URL in Supabase is set to `https://lenstock.netlify.app`

## How It Works

1. User clicks "Continue with Google" or "Start with Google"
2. Application calls `supabase.auth.signInWithOAuth({ provider: 'google' })`
3. User is redirected to Google's OAuth consent screen
4. After authorization, Google redirects back to `/auth/callback`
5. Supabase client automatically detects the session (PKCE flow)
6. User is redirected to `/stocks` on success

## Troubleshooting

### "Redirect URL mismatch" error
- Check that the redirect URL in Supabase matches exactly what's in your code
- The redirect URL should be: `https://lenstock.netlify.app/auth/callback`
- Verify it's added in both:
  - Google Cloud Console → OAuth Client → Authorized redirect URIs
  - Supabase Dashboard → Authentication → URL Configuration → Redirect URLs

### "Provider not enabled" error
- Make sure Google provider is enabled in Supabase Dashboard
- Verify Client ID and Client Secret are correctly entered

### Session not detected after callback
- Check browser console for errors
- Verify `detectSessionInUrl: true` is set in Supabase client config (already configured)
- Make sure the callback route is accessible

### CORS errors
- Ensure Site URL is set correctly in Supabase
- Add your domain to Redirect URLs in Supabase
- Check that environment variables are set correctly

## Notes

- The implementation uses Supabase's PKCE flow for enhanced security
- Sessions are automatically persisted in localStorage
- The Google icon is included as an SVG component
- Error handling is in place for common OAuth failures

