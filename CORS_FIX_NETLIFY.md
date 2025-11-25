# Fix CORS Error for lenstock.netlify.app

## Error
```
Access to fetch at 'https://lvmumjsocfvxxxzrdhnq.supabase.co/rest/v1/portfolio_holdings...' 
from origin 'https://lenstock.netlify.app' 
has been blocked by CORS policy
```

## Quick Fix (2 minutes)

### Step 1: Configure Supabase Site URL
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Set **Site URL** to: `https://lenstock.netlify.app`
5. Click **Save**

### Step 2: Add Redirect URLs
1. In the same **URL Configuration** page
2. Under **Redirect URLs**, click **Add URL**
3. Add these URLs (one at a time):
   - `https://lenstock.netlify.app/**`
   - `https://lenstock.netlify.app/*`
   - `https://lenstock.netlify.app/`
4. Click **Save** after each one

### Step 3: Wait and Test
1. Wait 1-2 minutes for changes to propagate
2. Clear browser cache or use incognito mode
3. Try accessing your portfolio again
4. CORS error should be resolved!

## Why This Happens

Supabase uses the **Site URL** to determine which domains are allowed to make requests. If it's not set or is incorrect, Supabase blocks requests from your Netlify domain for security reasons.

## Verification

After setting the Site URL, you can verify it's working:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to access portfolio
4. Check the request to `/rest/v1/portfolio_holdings`
5. Response headers should include: `Access-Control-Allow-Origin: https://lenstock.netlify.app`

## Still Not Working?

1. **Double-check the Site URL** - It must match your Netlify URL exactly (no trailing slash)
2. **Check Netlify environment variables** - Ensure `VITE_SUPABASE_URL` is set correctly
3. **Wait longer** - Sometimes changes take 2-3 minutes to propagate
4. **Clear browser cache** - Old CORS headers might be cached

