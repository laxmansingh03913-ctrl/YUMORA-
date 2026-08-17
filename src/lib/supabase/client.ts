import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rwqzuigozagzgioixpgn.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cXp1aWdvemFnemdpb2l4cGduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5ODA2NzksImV4cCI6MjEwMjU1NjY3OX0.yFhMlXfPIB1xtEHFt7SMPPiGAaNbI1w6wMNnRv8FhBk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
