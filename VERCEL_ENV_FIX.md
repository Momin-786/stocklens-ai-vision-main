# Fix: Works on Localhost but Not on Vercel

## The Problem
✅ Works perfectly on `localhost:8080`  
❌ Fails on Vercel with `ERR_CONNECTION_RESET`

This means your Supabase project is **active** and working. The issue is **Vercel configuration**.

## Most Common Cause: Missing Environment Variables in Vercel

Vite requires environment variables to be available at **BUILD TIME**, not just runtime.

## ✅ Step-by-Step Fix

### Step 1: Check Current Environment Variables

1. Go to your Vercel project: https://vercel.com/dashboard
2. Click on your project: **stocklens-ai-vision-main**
3. Go to **Settings** → **Environment Variables**
4. Check if these exist:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SITE_URL` (optional but recommended)

### Step 2: Add Missing Environment Variables

If any are missing, add them:

1. Click **Add New**
2. For each variable:

   **Variable 1:**
   - **Key:** `VITE_SUPABASE_URL`
   - **Value:** `https://lvmumjsocfvxxxzrdhnq.supabase.co`
   - **Environment:** Select **Production**, **Preview**, and **Development**
   - Click **Save**

   **Variable 2:**
   - **Key:** `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **Value:** Your anon/public key from Supabase
   - **How to find:** Supabase Dashboard → Settings → API → `anon` `public` key
   - **Environment:** Select **Production**, **Preview**, and **Development**
   - Click **Save**

   **Variable 3 (Recommended):**
   - **Key:** `VITE_SITE_URL`
   - **Value:** `https://stocklens-ai-vision-main.vercel.app`
   - **Environment:** Select **Production** only
   - Click **Save**

### Step 3: Verify Environment Selection

⚠️ **CRITICAL:** Make sure each variable is selected for:
- ✅ **Production** (for your main deployment)
- ✅ **Preview** (for PR previews)
- ✅ **Development** (optional, for local dev)

### Step 4: Redeploy

**IMPORTANT:** After adding/changing environment variables, you MUST redeploy:

1. Go to **Deployments** tab
2. Click the three dots (⋯) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

**OR** push a new commit to trigger automatic deployment.

### Step 5: Verify in Build Logs

After redeploying, check the build logs:

1. Go to **Deployments** → Click on the latest deployment
2. Click **Build Logs**
3. Look for any errors about missing environment variables
4. The build should complete successfully

## 🔍 How to Verify Environment Variables Are Set

### Method 1: Check Build Logs
- Build logs should not show "undefined" for environment variables
- Look for any warnings about missing env vars

### Method 2: Add Temporary Debug Code

Add this temporarily to see what's being used:

```typescript
// In src/integrations/supabase/client.ts (temporarily)
console.log('🔍 Environment Check:', {
  hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  urlPreview: import.meta.env.VITE_SUPABASE_URL?.substring(0, 30) + '...',
  isProduction: import.meta.env.PROD,
});
```

Then check browser console on Vercel deployment.

### Method 3: Check Network Tab
1. Open DevTools on Vercel deployment
2. Go to Network tab
3. Try to sign up
4. Check the request URL - it should show your Supabase URL
5. If it shows `undefined` or wrong URL, env vars aren't set

## 🚨 Common Mistakes

### Mistake 1: Only Setting for Production
- **Fix:** Set for Production, Preview, AND Development

### Mistake 2: Wrong Variable Names
- ❌ `SUPABASE_URL` (missing `VITE_` prefix)
- ✅ `VITE_SUPABASE_URL` (correct)

### Mistake 3: Not Redeploying After Adding
- **Fix:** Always redeploy after adding/changing env vars

### Mistake 4: Typos in Values
- Check for extra spaces
- Check for trailing slashes (should be none)
- Verify the exact URL from Supabase Dashboard

### Mistake 5: Using Service Role Key Instead of Anon Key
- ❌ Service role key (secret, starts with `eyJ...`)
- ✅ Anon/public key (safe to expose, also starts with `eyJ...` but different)
- **Where to find:** Supabase Dashboard → Settings → API → `anon` `public` key

## 📋 Quick Checklist

Before redeploying, verify:

- [ ] `VITE_SUPABASE_URL` is set in Vercel
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` is set in Vercel
- [ ] Both are set for **Production** environment
- [ ] Values match your local `.env.local` file
- [ ] No trailing slashes in URLs
- [ ] Using the **anon/public** key, not service role key
- [ ] You've clicked **Redeploy** after adding variables

## 🔧 Additional Vercel Configuration

### Check Vercel Build Settings

1. Go to **Settings** → **General**
2. Check **Build Command:** Should be `npm run build` or `vite build`
3. Check **Output Directory:** Should be `dist` (default for Vite)
4. Check **Install Command:** Should be `npm install`

### Check Framework Preset

1. Go to **Settings** → **General**
2. **Framework Preset:** Should be "Vite" or "Other"
3. If wrong, Vercel might not be handling env vars correctly

## 🆘 Still Not Working?

### 1. Check Supabase Site URL
Even if env vars are set, Supabase needs to allow your Vercel domain:

1. Go to Supabase Dashboard
2. **Authentication** → **URL Configuration**
3. Set **Site URL:** `https://stocklens-ai-vision-main.vercel.app`
4. Add to **Redirect URLs:** `https://stocklens-ai-vision-main.vercel.app/**`

### 2. Clear Vercel Cache
1. Go to **Settings** → **General**
2. Scroll to **Clear Build Cache**
3. Click **Clear**

### 3. Check Vercel Function Logs
1. Go to **Deployments** → Latest deployment
2. Click **Functions** tab
3. Check for any errors

### 4. Compare Local vs Vercel
- Check your local `.env.local` file
- Compare values with Vercel environment variables
- Make sure they match exactly

## ✅ Success Indicators

After fixing, you should see:
- ✅ No "undefined" in browser console
- ✅ Network requests go to correct Supabase URL
- ✅ Sign up works without connection errors
- ✅ Build logs show successful build

---

**Most likely fix:** Add missing environment variables in Vercel and redeploy.

