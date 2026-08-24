import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase project credentials for Plot Twist
const DEFAULT_SUPABASE_URL = 'https://kczsxllqnwcbxkccblrz.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_A9SBiFBD-cM5rHkgz-Z4jw__VYZxQ-G';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 20,
        },
      },
    })
  : null;
