# Fix: ERR_CONNECTION_RESET on Vercel (Localhost Works)

## Your Situation
✅ **Localhost works perfectly** - Supabase is ACTIVE  
❌ **Vercel fails with ERR_CONNECTION_RESET** - Vercel configuration issue

## Root Cause

Since localhost works, your Supabase project is **definitely active**. The connection reset on Vercel is caused by:

1. **Supabase Site URL not configured for Vercel domain** (Most Common - CORS Issue)
2. **Missing or incorrect environment variables in Vercel**
3. **Network/firewall blocking from Vercel's edge network**

## ✅ Step-by-Step Fix

### Step 1: Configure Supabase Site URL (CRITICAL)

This is the **most important step** - it fixes CORS issues:

1. Go to: https://app.supabase.com/
2. Select project: **lvmumjsocfvxxxzrdhnq**
3. Click **Authentication** → **URL Configuration**
4. **Set Site URL** to: `https://stocklens-ai-vision-main.vercel.app`
5. **Add Redirect URLs:**
   - `https://stocklens-ai-vision-main.vercel.app/**`
   - `https://stocklens-ai-vision-main.vercel.app/*`
   - `https://stocklens-ai-vision-main.vercel.app/`
6. Click **Save**

**Why this matters:** Supabase uses Site URL to determine which domains are allowed. Without it, Supabase blocks requests from your Vercel domain.

### Step 2: Verify Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select project: **stocklens-ai-vision-main**
3. **Settings** → **Environment Variables**
4. Verify these exist:

   **VITE_SUPABASE_URL:**
   - Value: `https://lvmumjsocfvxxxzrdhnq.supabase.co`
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **VITE_SUPABASE_PUBLISHABLE_KEY:**
   - Value: Your anon/public key
   - Environment: ✅ Production, ✅ Preview, ✅ Development

5. If missing, add them
6. If they exist, verify the values are correct (no typos, no extra spaces)

### Step 3: Redeploy on Vercel

**CRITICAL:** After making changes:

1. Go to **Deployments** tab
2. Click **⋯** on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### Step 4: Wait and Test

1. Wait 1-2 minutes after setting Site URL (for changes to propagate)
2. Clear browser cache or use incognito mode
3. Try signing up again
4. Should work now! ✅

## 🔍 Verification Checklist

After fixing, verify:

- [ ] Supabase Site URL is set to your Vercel domain
- [ ] Redirect URLs include your Vercel domain
- [ ] Vercel environment variables are set for Production
- [ ] Values match your local `.env.local` file
- [ ] You've redeployed on Vercel
- [ ] Waited 1-2 minutes after changes

## 🚨 Why This Happens

### The Connection Reset Explained

When you see `ERR_CONNECTION_RESET` on Vercel but localhost works:

1. **CORS Blocking:** Supabase blocks requests from unauthorized domains
2. **Site URL Missing:** Without Site URL configured, Supabase doesn't know to allow your Vercel domain
3. **Network Policy:** Vercel's edge network might have different network policies

### Why Localhost Works

- Localhost uses `http://localhost:8080` which might be in Supabase's allowed list
- Or your local `.env.local` has different configuration
- Local network doesn't have the same restrictions

## 📋 Quick Diagnostic

Check browser console for:
- ✅ `hasKey: true` - Environment variables are loaded
- ✅ `isProduction: true` - Running on Vercel
- ❌ `ERR_CONNECTION_RESET` - Connection being blocked

If you see `hasKey: true` but still get connection reset, it's **definitely** the Site URL configuration.

## 🆘 Still Not Working?

### Check These:

1. **Double-check Site URL:**
   - Must match exactly: `https://stocklens-ai-vision-main.vercel.app`
   - No trailing slash
   - Wait 2-3 minutes after setting

2. **Check Vercel Build Logs:**
   - Go to Deployments → Latest → Build Logs
   - Look for any errors about environment variables
   - Should not see "undefined" for env vars

3. **Test from Different Browser:**
   - Clear all cache
   - Try incognito/private mode
   - Try different browser

4. **Verify Supabase Project Status:**
   - Even though localhost works, double-check
   - Go to Supabase Dashboard → Settings → General
   - Should show "Active"

## ✅ Success Indicators

After fixing, you should see:
- ✅ No `ERR_CONNECTION_RESET` errors
- ✅ Network requests return 200 status
- ✅ Sign up works successfully
- ✅ No CORS errors in console

---

**Most likely fix:** Configure Supabase Site URL to your Vercel domain + Verify Vercel environment variables + Redeploy

