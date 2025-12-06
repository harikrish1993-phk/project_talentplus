// =============================================================================
// Supabase Client (Browser) - DEV MODE SAFE
// =============================================================================

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './database.types';

export const createClient = () => {
  // Check if Supabase is configured
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    // Dev mode: Return mock client
    console.warn('⚠️ Supabase not configured - Running in DEV MODE');
    return null as any;
  }
  
  return createClientComponentClient<Database>();
};

// Only create client if configured
let supabase: any = null;
try {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    supabase = createClient();
  }
} catch (e) {
  console.warn('Supabase client not initialized - running in dev mode');
}

export { supabase };