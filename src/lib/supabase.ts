import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL is not set. Please add it to your .env file.");
}
if (!supabaseAnonKey) {
  throw new Error("VITE_SUPABASE_ANON_KEY is not set. Please add it to your .env file.");
}

// Create a client with optimized configurations
const client = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      "Cache-Control": "no-cache",
    },
  },
  db: {
    schema: "public",
  },
});

// Disable realtime subscriptions
client.realtime.disconnect();
client.realtime.removeAllChannels();

export const supabase = client;
export { supabaseUrl };
