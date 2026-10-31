import { createClient } from "@supabase/supabase-js";

// ==========================================
// 1. Supabase Project URL
// ==========================================
const SUPABASE_URL = "https://ymxdypzryicdpkdgcprg.supabase.co";

// ==========================================
// 2. Supabase Anon / Public Key
// ==========================================
const SUPABASE_PUBLIC_KEY = "sb_publishable_QRbRXa97SlOzUaBjlDv-dA_URF7QUPt";

// Initialize and export the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

if (typeof window !== "undefined") {
  window.supabaseClient = supabase;

  // Global auth state listener across the entire site
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const u = session.user;
      const meta = u.user_metadata || {};
      const userObj = {
        id: u.id,
        name: meta.full_name || meta.name || u.email?.split("@")[0] || "Student",
        email: u.email || "",
        avatar: meta.avatar_url || meta.picture || "",
        university: meta.university || "Campus Member"
      };

      if (typeof setCurrentUser === "function") {
        setCurrentUser(userObj);
      } else {
        try {
          localStorage.setItem("campus_share_current_user", JSON.stringify(userObj));
        } catch (e) {}
      }

      // Re-render UI components if they exist on the page
      if (typeof initNavbar === "function") initNavbar();
      if (typeof initProfilePage === "function" && document.getElementById("profile-header-content")) {
        initProfilePage();
      }
    } else if (event === "SIGNED_OUT") {
      if (typeof setCurrentUser === "function") {
        setCurrentUser(null);
      } else {
        try {
          localStorage.removeItem("campus_share_current_user");
        } catch (e) {}
      }
      if (typeof initNavbar === "function") initNavbar();
      if (typeof initProfilePage === "function" && document.getElementById("profile-header-content")) {
        initProfilePage();
      }
    }
  });

  // Clean URL hash if returning from OAuth redirect
  if (window.location.hash && window.location.hash.includes("access_token")) {
    setTimeout(() => {
      try {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      } catch (e) {}
    }, 600);
  }
}
