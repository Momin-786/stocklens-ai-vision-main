import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Validate environment variables
if (!SUPABASE_URL) {
  console.error('Missing VITE_SUPABASE_URL environment variable');
  throw new Error('Missing Supabase URL. Please check your environment variables.');
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  console.error('Missing VITE_SUPABASE_PUBLISHABLE_KEY environment variable');
  throw new Error('Missing Supabase key. Please check your environment variables.');
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