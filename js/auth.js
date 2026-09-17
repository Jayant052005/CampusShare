/* ==========================================================================
   CampusShare - Student Authentication Controller
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function() {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
      e.preventDefault();

      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;

      if (!email || !password) {
        showToast("Please enter your campus email and password", "warning");
        return;
      }

      if (!email.toLowerCase().includes(".edu") && !email.includes("@")) {
        showToast("Please enter a valid university email address (.edu)", "warning");
        return;
      }

      // Create or load student session
      const user = {
        id: "usr_" + Date.now(),
        name: email.split("@")[0].replace(".", " ").replace(/(^\w|\s\w)/g, m => m.toUpperCase()),
        email: email,
        university: "Stanford University",
        major: "Undergraduate Student",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80",
        rating: 5.0,
        reviewsCount: 1,
        verifiedStudent: true,
        joinedDate: "Sept 2026"
      };

      setCurrentUser(user);
      showToast("Welcome back! Signed in successfully.", "success");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 800);
    });
  }

  // Handle Registration
  if (registerForm) {
    registerForm.addEventListener("submit", function(e) {
      e.preventDefault();

      const name = document.getElementById("reg-name").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const university = document.getElementById("reg-university").value;
      const major = document.getElementById("reg-major").value.trim();
      const password = document.getElementById("reg-password").value;

      if (!name || !email || !university || !password) {
        showToast("Please fill in all required registration fields", "warning");
        return;
      }

      if (!email.toLowerCase().endsWith(".edu")) {
        showToast("Registration requires a verified student email ending in .edu", "warning");
        return;
      }

      const newUser = {
        id: "usr_" + Date.now(),
        name: name,
        email: email,
        university: university,
        major: major || "Student",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
        rating: 5.0,
        reviewsCount: 0,
        verifiedStudent: true,
        joinedDate: "Sept 2026"
      };

      setCurrentUser(newUser);
      showToast("Registration successful! Welcome to CampusShare.", "success");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 800);
    });
  }
});
