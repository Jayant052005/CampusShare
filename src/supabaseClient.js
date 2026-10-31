import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ymxdypzryicdpkdgcprg.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_QRbRXa97SlOzUaBjlDv-dA_URF7QUPt";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

if (typeof window !== "undefined") {
  window.supabaseClient = supabase;
}
