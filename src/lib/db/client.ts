// Database client re-export
import { createClient } from '@/lib/supabase/client';

export const db = createClient();
export { createClient };
