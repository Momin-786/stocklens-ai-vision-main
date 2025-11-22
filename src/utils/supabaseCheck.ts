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
 * Test Supabase connection by making a direct HTTP request
 * This bypasses the Supabase client to test raw connectivity
 */
export const testSupabaseConnection = async () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  
  if (!url) {
    return {
      connected: false,
      error: 'VITE_SUPABASE_URL is not set',
    };
  }

  try {
    // Test direct connection to Supabase health endpoint
    const healthUrl = `${url}/rest/v1/`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok || response.status === 404 || response.status === 401) {
      // 404/401 means the server is reachable, just not the right endpoint
      return {
        connected: true,
        message: 'Supabase server is reachable',
      };
    }

    return {
      connected: false,
      error: `Server returned status ${response.status}`,
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        connected: false,
        error: 'Connection timeout - Supabase project might be paused',
        suggestion: 'Check Supabase Dashboard → Settings → General → Resume Project if paused',
      };
    }

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
      error: error.message || 'Unknown connection error',
    };
  }
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

