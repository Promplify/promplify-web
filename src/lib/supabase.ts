import { createClient } from '@supabase/supabase-js';

// Validate Supabase URL and key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Add validation and helpful console messages
if (!supabaseUrl.includes('supabase.co')) {
  console.error('Invalid Supabase URL. Please set VITE_SUPABASE_URL in your environment variables.');
  console.log('You can find your Supabase URL in your project settings at https://supabase.com/dashboard/project/_/settings/api');
}

if (supabaseAnonKey === 'your-anon-key') {
  console.error('Invalid Supabase Anon Key. Please set VITE_SUPABASE_ANON_KEY in your environment variables.');
  console.log('You can find your Supabase Anon Key in your project settings at https://supabase.com/dashboard/project/_/settings/api');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);