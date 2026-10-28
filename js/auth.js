/* ==========================================================================
   CampusShare - Student Authentication Controller (Mock Auth Prototype)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function() {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const googleLoginBtn = document.getElementById("google-login-btn");
  const googleRegisterBtn = document.getElementById("google-register-btn");
  const forgotPasswordLink = document.getElementById("forgot-password-link");

  // Handle Login Form
  if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
      e.preventDefault();

      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;

      if (!email || !password) {
        if (typeof showToast === "function") showToast("Please enter your campus email and password", "warning");
        return;
      }

      if (!email.toLowerCase().includes(".edu") && !email.includes("@")) {
        if (typeof showToast === "function") showToast("Please enter a valid university email address (.edu)", "warning");
        return;
      }

      // Mock authentication via storage
      const user = loginUser(email, password);

      if (typeof showToast === "function") {
        showToast(`Welcome back, ${user.name}! Signed in successfully.`, "success");
      }

      const targetUrl = typeof getAppUrl === "function" ? getAppUrl("profile.html") : "profile.html";
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 700);
    });
  }

  // Handle Google Login Mock
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", function() {
      const googleUser = loginUser("jordan.taylor@stanford.edu", "google_sso");
      if (typeof showToast === "function") {
        showToast("Signed in via Google Student Account", "success");
      }
      const targetUrl = typeof getAppUrl === "function" ? getAppUrl("profile.html") : "profile.html";
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 700);
    });
  }

  // Handle Forgot Password
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", function(e) {
      e.preventDefault();
      const emailInput = document.getElementById("login-email");
      const targetEmail = (emailInput && emailInput.value) ? emailInput.value.trim() : "your student email";
      if (typeof showToast === "function") {
        showToast(`Password reset link sent to ${targetEmail}`, "info");
      }
    });
  }

  // Handle Register Form
  if (registerForm) {
    registerForm.addEventListener("submit", function(e) {
      e.preventDefault();

      const name = document.getElementById("reg-name").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const university = document.getElementById("reg-university").value;
      const password = document.getElementById("reg-password").value;
      const confirmPassword = document.getElementById("reg-confirm-password").value;

      if (!name || !email || !university || !password || !confirmPassword) {
        if (typeof showToast === "function") showToast("Please fill in all required fields", "warning");
        return;
      }

      if (!email.toLowerCase().includes(".edu")) {
        if (typeof showToast === "function") showToast("CampusShare requires a verified student email (.edu)", "warning");
        return;
      }

      if (password !== confirmPassword) {
        if (typeof showToast === "function") showToast("Passwords do not match. Please verify both passwords.", "error");
        return;
      }

      if (password.length < 6) {
        if (typeof showToast === "function") showToast("Password must be at least 6 characters long", "warning");
        return;
      }

      // Register user via storage
      const newUser = registerUser({
        name: name,
        email: email,
        university: university,
        college: university,
        major: "Undergraduate Student",
        password: password
      });

      if (typeof showToast === "function") {
        showToast(`Account created for ${newUser.name}! Welcome to CampusShare.`, "success");
      }

      const targetUrl = typeof getAppUrl === "function" ? getAppUrl("profile.html") : "profile.html";
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 700);
    });
  }

  // Handle Google Register Mock
  if (googleRegisterBtn) {
    googleRegisterBtn.addEventListener("click", function() {
      const googleUser = registerUser({
        name: "Jordan Taylor",
        email: "jordan.taylor@stanford.edu",
        university: "Stanford University",
        college: "Stanford University",
        major: "Computer Science '26"
      });

      if (typeof showToast === "function") {
        showToast("Registered with Google Student Account!", "success");
      }

      const targetUrl = typeof getAppUrl === "function" ? getAppUrl("profile.html") : "profile.html";
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 700);
    });
  }
});
