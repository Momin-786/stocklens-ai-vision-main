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
 * Test Supabase connection
 */
export const testSupabaseConnection = async () => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Try a simple health check by getting the current session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return {
        connected: false,
        error: error.message,
      };
    }

    return {
      connected: true,
      hasSession: !!data.session,
    };
  } catch (error: any) {
    console.error('Supabase connection test error:', error);
    return {
      connected: false,
      error: error.message || 'Unknown error',
    };
  }
};

