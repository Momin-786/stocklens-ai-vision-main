# ✅ ACTION CHECKLIST - Fix ERR_CONNECTION_RESET on Vercel

## Current Status
✅ Localhost works - Supabase is ACTIVE  
❌ Vercel fails - Configuration issue

## ⚡ Quick Fix (5 minutes)

### ✅ Step 1: Configure Supabase Site URL (MOST IMPORTANT)

**This is 90% likely to be the issue.**

1. Open: https://app.supabase.com/
2. Select project: **lvmumjsocfvxxxzrdhnq**
3. Click **Authentication** (left sidebar)
4. Click **URL Configuration**
5. Find **Site URL** field
6. **Set it to:** `https://stocklens-ai-vision-main.vercel.app`
   - ⚠️ Must match EXACTLY (no trailing slash)
7. Scroll to **Redirect URLs**
8. Click **Add URL** and add:
   - `https://stocklens-ai-vision-main.vercel.app/**`
9. Click **Add URL** again and add:
   - `https://stocklens-ai-vision-main.vercel.app/*`
10. Click **Save**

**Wait 1-2 minutes** for changes to propagate.

### ✅ Step 2: Double-Check Vercel Environment Variables

1. Open: https://vercel.com/dashboard
2. Select project: **stocklens-ai-vision-main**
3. Click **Settings** → **Environment Variables**
4. Verify these exist:

   **Variable 1:**
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://lvmumjsocfvxxxzrdhnq.supabase.co`
   - ✅ Checked: Production, Preview, Development

   **Variable 2:**
   - Name: `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Value: [Your anon key - should be long, starts with `eyJ`]
   - ✅ Checked: Production, Preview, Development

5. If missing, **Add** them
6. If they exist but wrong, **Edit** them
7. Make sure **Production** is checked for both

### ✅ Step 3: Redeploy on Vercel

**CRITICAL:** After any changes:

1. Go to **Deployments** tab
2. Find latest deployment
3. Click **⋯** (three dots)
4. Click **Redeploy**
5. Wait for deployment to finish

### ✅ Step 4: Test

1. Wait 2-3 minutes after Step 1 (for Supabase changes to propagate)
2. Open your Vercel app: https://stocklens-ai-vision-main.vercel.app
3. Open browser console (F12)
4. Try to sign up
5. Should work! ✅

## 🔍 Verification

After completing all steps, check:

- [ ] Supabase Site URL = `https://stocklens-ai-vision-main.vercel.app`
- [ ] Redirect URLs include your Vercel domain
- [ ] Vercel env vars are set for Production
- [ ] You've redeployed on Vercel
- [ ] Waited 2-3 minutes after changes

## ❌ Still Not Working?

### Check These:

1. **Supabase Project Status:**
   - Go to Supabase Dashboard → Settings → General
   - Should show "Active" (not "Paused")
   - If paused, click "Resume Project"

2. **Test Direct Connection:**
   - Open browser console on Vercel
   - Run: `fetch('https://lvmumjsocfvxxxzrdhnq.supabase.co/auth/v1/health')`
   - Check if it succeeds or fails

3. **Check Network Tab:**
   - Open DevTools → Network
   - Try to sign up
   - Look at the request to `/auth/v1/signup`
   - Check response headers for CORS errors

4. **Verify URL Format:**
   - Site URL: `https://stocklens-ai-vision-main.vercel.app` (no trailing slash)
   - Supabase URL: `https://lvmumjsocfvxxxzrdhnq.supabase.co` (no trailing slash)

## 🎯 Most Likely Issue

Based on your error, the **Site URL** in Supabase is probably not set to your Vercel domain. This causes Supabase to reset connections from unauthorized domains.

**Fix:** Set Site URL in Supabase Dashboard → Authentication → URL Configuration

---

**Follow Steps 1-4 above. This should fix it!**

