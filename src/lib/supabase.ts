import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jnwfnaexsmxqtbotkcon.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impud2ZuYWV4c214cXRib3RrY29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNTA5OTcsImV4cCI6MjA1MTkyNjk5N30.5SfFcD1os-yagiD3HUOiR-xEbxxGrkWdc86IT5HGb7Y';

// Add validation and helpful console messages
if (!supabaseUrl.includes('supabase.co')) {
  console.error('Invalid Supabase URL format');
}

if (!supabaseAnonKey.includes('.')) {
  console.error('Invalid Supabase Anon Key format');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);