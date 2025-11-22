import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Validate environment variables
if (!SUPABASE_URL) {
  const isProduction = import.meta.env.PROD;
  const errorMsg = isProduction 
    ? 'Missing VITE_SUPABASE_URL in Vercel. Go to Vercel → Settings → Environment Variables → Add VITE_SUPABASE_URL'
    : 'Missing VITE_SUPABASE_URL environment variable. Check your .env.local file.';
  console.error('❌ Missing VITE_SUPABASE_URL environment variable');
  console.error('📍 Location:', isProduction ? 'Vercel Dashboard → Settings → Environment Variables' : 'Local .env.local file');
  throw new Error(errorMsg);
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  const isProduction = import.meta.env.PROD;
  const errorMsg = isProduction
    ? 'Missing VITE_SUPABASE_PUBLISHABLE_KEY in Vercel. Go to Vercel → Settings → Environment Variables → Add VITE_SUPABASE_PUBLISHABLE_KEY'
    : 'Missing VITE_SUPABASE_PUBLISHABLE_KEY environment variable. Check your .env.local file.';
  console.error('❌ Missing VITE_SUPABASE_PUBLISHABLE_KEY environment variable');
  console.error('📍 Location:', isProduction ? 'Vercel Dashboard → Settings → Environment Variables' : 'Local .env.local file');
  throw new Error(errorMsg);
}

// Debug logging in development
if (import.meta.env.DEV) {
  console.log('✅ Supabase environment variables loaded:', {
    url: SUPABASE_URL.substring(0, 30) + '...',
    hasKey: !!SUPABASE_PUBLISHABLE_KEY,
    keyLength: SUPABASE_PUBLISHABLE_KEY?.length || 0,
  });
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    redirectTo: import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
    flowType: 'pkce', // Use PKCE flow for better security
  },
  global: {
    headers: {
      'x-client-info': 'stocklens-web',
    },
  },
});