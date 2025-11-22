# Fix: ERR_CONNECTION_RESET Error

## Error Message
```
Failed to load resource: net::ERR_CONNECTION_RESET
TypeError: Failed to fetch
```

## Most Common Cause: Supabase Project is Paused

**Free tier Supabase projects automatically pause after 7 days of inactivity.**

## Quick Fix (5 minutes)

### Step 1: Check if Project is Paused
1. Go to https://app.supabase.com/
2. Select your project: **lvmumjsocfvxxxzrdhnq**
3. Look at the project status:
   - If you see "Paused" or "Inactive" → Continue to Step 2
   - If it shows "Active" → Skip to Step 3

### Step 2: Resume Your Project
1. In Supabase Dashboard, click **Settings** (gear icon)
2. Go to **General** tab
3. Look for **Project Status**
4. If paused, click **"Resume Project"** or **"Restore Project"**
5. Wait 1-2 minutes for the project to fully restart

### Step 3: Verify Project is Active
1. Check the project dashboard - it should show "Active"
2. Wait 2-3 minutes after resuming (services need time to start)
3. Try signing up again

## Other Possible Causes

### 1. Network/Firewall Issues
- Try from a different network (mobile hotspot, different WiFi)
- Check if your network blocks Supabase domains
- Try from a different device

### 2. Environment Variables Not Set
- Go to Vercel → Your Project → Settings → Environment Variables
- Verify these are set:
  - `VITE_SUPABASE_URL=https://lvmumjsocfvxxxzrdhnq.supabase.co`
  - `VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key`
- Make sure they're set for **Production** environment
- Redeploy after adding variables

### 3. Incorrect Supabase URL
- Verify URL format: `https://lvmumjsocfvxxxzrdhnq.supabase.co`
- No trailing slash
- Check in Supabase Dashboard → Settings → API

### 4. Rate Limits Exceeded
- Free tier has rate limits
- Wait a few minutes and try again
- Check Supabase Dashboard for rate limit warnings

## Verification Steps

After fixing, verify it's working:

1. **Test Supabase Connection:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try to sign up
   - Check the request to `/auth/v1/signup`
   - Should return 200 status (not connection reset)

2. **Check Browser Console:**
   - Look for any error messages
   - Should not see "ERR_CONNECTION_RESET"

3. **Test from Different Network:**
   - If it works on one network but not another, it's a firewall issue

## Prevention

To prevent your project from pausing:

1. **Upgrade to Pro Plan** (if needed) - Pro plans don't pause
2. **Regular Activity** - Use the project at least once every 7 days
3. **Set Up Monitoring** - Use Supabase monitoring to track activity

## Still Not Working?

1. **Check Supabase Status Page:**
   - https://status.supabase.com/
   - See if there are any ongoing issues

2. **Contact Supabase Support:**
   - If project won't resume
   - If you see errors in Supabase Dashboard

3. **Check Vercel Logs:**
   - Go to Vercel → Your Project → Deployments
   - Check build logs for environment variable issues

4. **Verify Environment Variables:**
   - Make sure they're set correctly
   - Check for typos
   - Ensure no extra spaces

## Code Changes Made

The code now includes:
- Automatic retry logic (2 attempts with backoff)
- Better error messages mentioning paused projects
- Detailed console logging for debugging

