# Final Fix: Works on Localhost, Fails on Vercel

## The Situation
✅ **Localhost works perfectly** - This proves your Supabase project is **ACTIVE**  
❌ **Vercel fails with ERR_CONNECTION_RESET** - This is a **Vercel configuration issue**

## Root Cause

Since localhost works, your Supabase project is definitely active. The connection reset on Vercel is caused by one of these:

1. **Missing Environment Variables in Vercel** (Most Common)
2. **Supabase Site URL Not Configured for Vercel Domain** (CORS Issue)
3. **Environment Variables Not Set for Production Environment**

## ✅ Complete Fix Checklist

### Step 1: Add Environment Variables in Vercel

1. Go to: https://vercel.com/dashboard
2. Select project: **stocklens-ai-vision-main**
3. **Settings** → **Environment Variables**
4. Add these (if missing):

   **Variable 1:**
   ```
   Key: VITE_SUPABASE_URL
   Value: https://lvmumjsocfvxxxzrdhnq.supabase.co
   Environments: ✅ Production, ✅ Preview, ✅ Development
   ```

   **Variable 2:**
   ```
   Key: VITE_SUPABASE_PUBLISHABLE_KEY
   Value: [Your anon/public key from Supabase]
   Environments: ✅ Production, ✅ Preview, ✅ Development
   ```

   **Variable 3 (Recommended):**
   ```
   Key: VITE_SITE_URL
   Value: https://stocklens-ai-vision-main.vercel.app
   Environments: ✅ Production only
   ```

5. **Save each variable**

### Step 2: Configure Supabase Site URL

1. Go to: https://app.supabase.com/
2. Select project: **lvmumjsocfvxxxzrdhnq**
3. **Authentication** → **URL Configuration**
4. Set **Site URL** to: `https://stocklens-ai-vision-main.vercel.app`
5. Add to **Redirect URLs**:
   - `https://stocklens-ai-vision-main.vercel.app/**`
   - `https://stocklens-ai-vision-main.vercel.app/*`
   - `https://stocklens-ai-vision-main.vercel.app/`
6. **Save**

### Step 3: Redeploy on Vercel

**CRITICAL:** After adding/changing environment variables:

1. Go to **Deployments** tab
2. Click **⋯** on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### Step 4: Verify

1. Open your Vercel deployment
2. Open browser console (F12)
3. Try to sign up
4. Should work now! ✅

## 🔍 How to Verify Environment Variables

### Check Browser Console

After redeploying, open console and look for:
- ✅ Should see: `✅ Supabase environment variables loaded`
- ❌ Should NOT see: `Missing VITE_SUPABASE_URL` or `undefined`

### Check Network Tab

1. Open DevTools → Network tab
2. Try to sign up
3. Look for request to: `https://lvmumjsocfvxxxzrdhnq.supabase.co/auth/v1/signup`
4. Should return 200 (not connection reset)

## 🚨 Common Mistakes

### ❌ Mistake 1: Only Setting for Preview
- **Fix:** Must set for **Production** environment

### ❌ Mistake 2: Wrong Variable Names
- ❌ `SUPABASE_URL` (missing `VITE_` prefix)
- ✅ `VITE_SUPABASE_URL` (correct)

### ❌ Mistake 3: Not Redeploying
- **Fix:** Always redeploy after adding env vars

### ❌ Mistake 4: Site URL Not Set in Supabase
- **Fix:** Set Site URL to your Vercel domain in Supabase Dashboard

## 📋 Quick Verification Checklist

Before testing:
- [ ] `VITE_SUPABASE_URL` exists in Vercel
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` exists in Vercel
- [ ] Both set for **Production** environment
- [ ] Values match your local `.env.local`
- [ ] Supabase Site URL set to Vercel domain
- [ ] Redeployed after adding variables

## 🎯 Why This Happens

1. **Vite requires env vars at BUILD TIME**
   - If missing during build, they're `undefined` in production
   - Localhost works because `.env.local` provides them

2. **CORS requires Site URL configuration**
   - Supabase blocks requests from unauthorized domains
   - Site URL tells Supabase to allow your Vercel domain

3. **Environment-specific settings**
   - Variables must be set for the correct environment (Production)

## ✅ Success Indicators

After fixing, you should see:
- ✅ No "undefined" in browser console
- ✅ Network requests succeed (200 status)
- ✅ Sign up works without errors
- ✅ No connection reset errors

---

**Most likely fix:** Add environment variables in Vercel + Configure Supabase Site URL + Redeploy

