# Browser Console Diagnostic Commands

Run these commands in your browser console on the Vercel deployment to diagnose the issue.

## Step 1: Get Your Supabase Configuration

**Method 1: Use Diagnostic Tool (if available in dev mode)**

```javascript
// Check if diagnostic tool is available
if (window.__SUPABASE_DIAGNOSTIC__) {
  console.log('URL:', window.__SUPABASE_DIAGNOSTIC__.url);
  console.log('Has Key:', window.__SUPABASE_DIAGNOSTIC__.hasKey);
  
  // Test connection
  window.__SUPABASE_DIAGNOSTIC__.testConnection().then(result => {
    console.log('Connection test:', result);
  });
}
```

**Method 2: Get from Network Tab**

1. Open DevTools → Network tab
2. Try to sign up
3. Click on the failed request to `/auth/v1/signup`
4. Check the **Request URL** - it shows your Supabase URL
5. Check **Request Headers** - look for `apikey` header value

**Method 3: Get from Supabase Dashboard**

1. Go to Supabase Dashboard → Settings → API
2. Copy the **Project URL**: `https://lvmumjsocfvxxxzrdhnq.supabase.co`
3. Copy the **anon public** key

## Step 2: Test Direct Connection

**Get your anon key first:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the **anon public** key (long string starting with `eyJ`)

**Then run this test (replace YOUR_ANON_KEY):**

```javascript
// Test 1: Health endpoint
const anonKey = 'YOUR_ANON_KEY_HERE'; // Replace with your actual key

fetch('https://lvmumjsocfvxxxzrdhnq.supabase.co/auth/v1/health', {
  headers: { 
    'apikey': anonKey,
    'Content-Type': 'application/json'
  }
})
  .then(r => {
    console.log('✅ Health check status:', r.status);
    console.log('Response headers:', {
      'access-control-allow-origin': r.headers.get('access-control-allow-origin'),
      'content-type': r.headers.get('content-type')
    });
    return r.text();
  })
  .then(text => console.log('Response body:', text))
  .catch(e => {
    console.error('❌ Health check failed:', e);
    console.error('Error type:', e.name);
    console.error('Error message:', e.message);
  });
```

## Step 3: Test Signup Endpoint (CORS Test)

```javascript
// Test 2: Signup endpoint (this will fail but show CORS info)
fetch('https://lvmumjsocfvxxxzrdhnq.supabase.co/auth/v1/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'YOUR_ANON_KEY_HERE'
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test123456'
  })
})
  .then(r => {
    console.log('✅ Signup endpoint reachable, status:', r.status);
    return r.json();
  })
  .then(data => console.log('Response:', data))
  .catch(e => {
    console.error('❌ Signup endpoint failed:', e);
    console.error('Error type:', e.name);
    console.error('Error message:', e.message);
  });
```

## Step 4: Check CORS Headers

```javascript
// Test 3: Check CORS preflight
fetch('https://lvmumjsocfvxxxzrdhnq.supabase.co/auth/v1/signup', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://stocklens-ai-vision-main.vercel.app',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'content-type,apikey'
  }
})
  .then(r => {
    console.log('✅ CORS preflight status:', r.status);
    console.log('CORS headers:', {
      'access-control-allow-origin': r.headers.get('access-control-allow-origin'),
      'access-control-allow-methods': r.headers.get('access-control-allow-methods'),
      'access-control-allow-headers': r.headers.get('access-control-allow-headers')
    });
  })
  .catch(e => console.error('❌ CORS preflight failed:', e));
```

## Step 5: Check Network Tab Details

1. Open DevTools → Network tab
2. Try to sign up
3. Click on the failed request to `/auth/v1/signup`
4. Check:
   - **Request Headers** - Are all headers present?
   - **Response Headers** - Any CORS headers?
   - **Status Code** - What's the actual status?
   - **Timing** - Does it timeout or fail immediately?

## What to Look For

### If Health Check Works but Signup Fails:
- **CORS issue** - Check Site URL configuration
- **Authentication issue** - Check API key

### If Both Fail:
- **Network blocking** - Check firewall/network policies
- **Supabase project issue** - Check project status
- **Regional issue** - Check Supabase region

### If CORS Preflight Fails:
- **Site URL not configured** - Set in Supabase Dashboard
- **Origin not whitelisted** - Add to Redirect URLs

## Quick Test: Get Your Anon Key

To get your anon key for testing:

1. Go to Supabase Dashboard → Settings → API
2. Copy the `anon` `public` key
3. Replace `YOUR_ANON_KEY_HERE` in the commands above

## Alternative: Check from Network Tab

Instead of console commands, check the Network tab:

1. Open DevTools → Network
2. Filter by "supabase"
3. Try to sign up
4. Click on the failed request
5. Check:
   - **General tab**: Request URL, Status Code, Remote Address
   - **Headers tab**: Request/Response headers
   - **Response tab**: Any error message
   - **Timing tab**: Where it fails (DNS, Connect, SSL, etc.)

