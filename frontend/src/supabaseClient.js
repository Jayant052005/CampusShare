import { createClient } from "@supabase/supabase-js";

// ==========================================
// 1. Paste your Supabase Project URL here:
// ==========================================
const SUPABASE_URL = "https://ymxdypzryicdpkdgcprg.supabase.co";

// ==========================================
// 2. Paste your Supabase Anon / Public Key here:
// ==========================================
const SUPABASE_PUBLIC_KEY = "sb_publishable_QRbRXa97SlOzUaBjlDv-dA_URF7QUPt";

// Initialize and export the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

if (typeof window !== "undefined") {
  window.supabaseClient = supabase;
}
