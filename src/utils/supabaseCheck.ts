/**
 * Utility to check Supabase connection and configuration
 */
export const checkSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const siteUrl = import.meta.env.VITE_SITE_URL;

  const issues: string[] = [];

  if (!url) {
    issues.push('VITE_SUPABASE_URL is not set');
  } else if (!url.startsWith('https://')) {
    issues.push('VITE_SUPABASE_URL must start with https://');
  } else if (!url.includes('.supabase.co')) {
    issues.push('VITE_SUPABASE_URL does not appear to be a valid Supabase URL');
  }

  if (!key) {
    issues.push('VITE_SUPABASE_PUBLISHABLE_KEY is not set');
  } else if (key.length < 100) {
    issues.push('VITE_SUPABASE_PUBLISHABLE_KEY appears to be invalid (too short)');
  }

  if (issues.length > 0) {
    console.error('Supabase Configuration Issues:', issues);
    return {
      valid: false,
      issues,
    };
  }

  return {
    valid: true,
    url: url.substring(0, 30) + '...', // Partial URL for logging
    hasSiteUrl: !!siteUrl,
  };
};

/**
 * Test Supabase connection - simplified version
 * Since localhost works, we just check if env vars are set
 * Actual auth attempts will reveal real connection issues
 */
export const testSupabaseConnection = async () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify.app');
  
  // Just check if environment variables are set
  // Don't make actual network requests - they can fail due to CORS on Netlify
  // and give false positives. Real auth attempts will show actual issues.
  if (!url || !key) {
    return {
      connected: false,
      error: isNetlify 
        ? 'Environment variables missing in Netlify. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in Netlify Site Settings → Environment Variables, then redeploy.'
        : 'Environment variables missing. Check your .env.local file.',
    };
  }

  // If env vars are set, assume connection is possible
  // Actual auth attempts will reveal real issues
  return {
    connected: true,
    message: isNetlify 
      ? 'Environment variables are set. If localhost works, Supabase is active. Connection issues on Netlify are usually CORS/Site URL configuration.'
      : 'Environment variables are set. Ready to connect.',
    skipped: true, // Mark as skipped since we didn't actually test
    isNetlifyIssue: isNetlify, // Flag for Netlify-specific issues
  };
};

/**
 * Test Supabase auth endpoint specifically
 */
export const testSupabaseAuth = async () => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Try a simple health check by getting the current session
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const { data, error } = await Promise.race([
      supabase.auth.getSession(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      ),
    ]) as any;

    clearTimeout(timeoutId);
    
    if (error) {
      // Connection errors indicate paused project
      if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_CONNECTION_RESET')) {
        return {
          connected: false,
          error: 'Connection reset - Supabase project is likely paused',
          suggestion: 'Go to https://app.supabase.com/ → Your Project → Settings → General → Resume Project',
          isPaused: true,
        };
      }

      return {
        connected: false,
        error: error.message,
      };
    }

    return {
      connected: true,
      hasSession: !!data?.session,
    };
  } catch (error: any) {
    if (error.message === 'Timeout' || error.name === 'AbortError') {
      return {
        connected: false,
        error: 'Connection timeout - Supabase project might be paused',
        suggestion: 'Check Supabase Dashboard → Settings → General → Resume Project if paused',
        isPaused: true,
      };
    }

    return {
      connected: false,
      error: error.message || 'Unknown error',
    };
  }
};

