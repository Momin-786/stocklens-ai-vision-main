# ⚠️ IMMEDIATE FIX: ERR_CONNECTION_RESET

## Your Error
```
POST https://lvmumjsocfvxxxzrdhnq.supabase.co/auth/v1/signup
net::ERR_CONNECTION_RESET
TypeError: Failed to fetch
```

## 🎯 99% Chance: Your Supabase Project is PAUSED

Free tier Supabase projects **automatically pause after 7 days of inactivity**.

## ✅ 3-Minute Fix

### Step 1: Open Supabase Dashboard
👉 **Click here:** https://app.supabase.com/

### Step 2: Select Your Project
- Look for project: **lvmumjsocfvxxxzrdhnq**
- Click on it

### Step 3: Check Project Status
- Look at the top of the dashboard
- If you see **"Paused"** or **"Inactive"** → Continue to Step 4
- If it shows **"Active"** → Skip to "Still Not Working?" below

### Step 4: Resume Your Project
1. Click **Settings** (gear icon) in the left sidebar
2. Click **General** tab
3. Scroll to **Project Status**
4. Click **"Resume Project"** or **"Restore Project"** button
5. Wait for confirmation message

### Step 5: Wait for Services to Start
⏱️ **IMPORTANT:** Wait **2-3 minutes** after clicking Resume
- Services need time to fully restart
- Don't try to sign up immediately

### Step 6: Test Again
1. Go back to your Vercel app
2. Try signing up again
3. Should work now! ✅

## 🔍 How to Verify It's Fixed

1. **Check Supabase Dashboard:**
   - Project should show "Active" status
   - No "Paused" or "Inactive" indicators

2. **Test in Browser:**
   - Open DevTools (F12)
   - Go to Network tab
   - Try to sign up
   - Request to `/auth/v1/signup` should return 200 (not connection reset)

## ❌ Still Not Working?

### Check These:

1. **Environment Variables in Vercel:**
   - Go to Vercel → Your Project → Settings → Environment Variables
   - Verify:
     - `VITE_SUPABASE_URL=https://lvmumjsocfvxxxzrdhnq.supabase.co`
     - `VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key`
   - Make sure they're set for **Production**
   - Redeploy after adding/changing

2. **Supabase Site URL:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Set **Site URL** to: `https://stocklens-ai-vision-main.vercel.app`
   - Add to **Redirect URLs**: `https://stocklens-ai-vision-main.vercel.app/**`

3. **Try Different Network:**
   - Some networks/firewalls block Supabase
   - Try mobile hotspot
   - Try different WiFi

4. **Check Supabase Status:**
   - https://status.supabase.com/
   - See if there are any ongoing issues

## 📝 What Changed in the Code

The app now:
- ✅ Automatically tests connection on page load
- ✅ Shows warning if project appears paused
- ✅ Retries failed connections (2 attempts)
- ✅ Provides clear error messages with direct links

## 🚫 Prevention

To prevent pausing:
1. Use the project at least once every 7 days
2. Upgrade to Pro plan (doesn't pause)
3. Set up monitoring/alerts

---

**Most likely fix:** Resume your paused Supabase project (Steps 1-6 above)

