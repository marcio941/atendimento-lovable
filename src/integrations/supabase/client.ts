import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://brlprkcmxxoiyxmcapww.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJybHBya2NteHhvaXl4bWNhcHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MjEyNDUsImV4cCI6MjA5MDM5NzI0NX0.e94z1xlTNzsIcwhGamlK1b5CE4Kx2rk1g1fdmUgHKKM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});