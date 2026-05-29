import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || "https://placeholder-url.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "placeholder-key";

// We create a single client instance
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to check DB connection
export async function testConnection() {
  if (SUPABASE_URL.includes("placeholder")) {
    console.warn("Supabase not configured. Operating in mock DB mode.");
    return false;
  }
  return true;
}
