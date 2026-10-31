/* ==========================================================================
   CampusShare - Main Global Controller
   Currency: Indian Rupees (₹ INR) only
   ========================================================================== */

// Smart URL routing helper for multi-folder structure
function getAppUrl(pageWithQuery) {
  const isInHtmlFolder = window.location.pathname.includes("/html/");
  const isInItemFolder = window.location.pathname.includes("/item/");
  
  let page = pageWithQuery;
  let extra = "";
  
  // Separate query and hash
  const qIdx = page.indexOf("?");
  const hIdx = page.indexOf("#");
  
  let splitIdx = -1;
  if (qIdx !== -1 && hIdx !== -1) {
    splitIdx = Math.min(qIdx, hIdx);
  } else if (qIdx !== -1) {
    splitIdx = qIdx;
  } else if (hIdx !== -1) {
    splitIdx = hIdx;
  }
  
  if (splitIdx !== -1) {
    extra = page.substring(splitIdx);
    page = page.substring(0, splitIdx);
  }

  if (page === "index.html") {
    if (isInHtmlFolder || isInItemFolder) {
      return "../index.html" + extra;
    }
    return "index.html" + extra;
  }

  if (isInHtmlFolder) {
    return page + extra;
  }
  if (isInItemFolder) {
    return "../html/" + page + extra;
  }

  return `html/${page}` + extra;
}

document.addEventListener("DOMContentLoaded", function() {
  initNavbar();
  initFooter();
  initMobileDrawer();
  updateHeaderWishlistCount();
  updateHeaderNotifications();
  initNavSearch();
});

// Toast Notification Manager
function showToast(message, type = "info") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = "ℹ️";
  if (type === "success") icon = "✓";
  if (type === "error") icon = "✕";
  if (type === "warning") icon = "⚠️";

  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-weight: bold; font-size: 1.1rem;">${icon}</span>
      <span>${message}</span>
    </div>
    <button style="background:none; border:none; color:inherit; cursor:pointer; font-size: 1.1rem;" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Confirmation Modal Manager (Replaces native alert/confirm)
// Supports both object-style: showConfirmModal({title, message, confirmText, confirmClass, onConfirm})
// and positional-style: showConfirmModal(title, message, onConfirm) for backward compat
function showConfirmModal(titleOrConfig, message, onConfirm, confirmText = "Confirm", confirmClass = "btn-danger") {
  // Detect object-style call
  if (titleOrConfig && typeof titleOrConfig === "object") {
    const cfg = titleOrConfig;
    return showConfirmModal(cfg.title, cfg.message, cfg.onConfirm, cfg.confirmText || "Confirm", cfg.confirmClass || "btn-danger");
  }
  const title = titleOrConfig;
  let modal = document.getElementById("cs-confirm-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "cs-confirm-modal";
    modal.className = "modal-overlay";
    modal.style.cssText = "display:none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(7, 24, 46, 0.6); backdrop-filter: blur(4px); z-index: 2500; align-items: center; justify-content: center;";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="background: white; border-radius: 20px; width: 90%; max-width: 440px; padding: 28px; box-shadow: 0 20px 50px rgba(0,0,0,0.25); position: relative;">
      <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--navy); margin-bottom: 8px;">${title}</h3>
      <p style="font-size: 0.95rem; color: var(--secondary-text); line-height: 1.5; margin-bottom: 24px;">${message}</p>
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button type="button" class="btn btn-outline" id="cs-confirm-cancel-btn">Cancel</button>
        <button type="button" class="btn ${confirmClass}" id="cs-confirm-ok-btn">${confirmText}</button>
      </div>
    </div>
  `;

  modal.style.display = "flex";

  const cancelBtn = modal.querySelector("#cs-confirm-cancel-btn");
  const okBtn = modal.querySelector("#cs-confirm-ok-btn");

  const closeModal = () => { modal.style.display = "none"; };
  cancelBtn.onclick = closeModal;
  okBtn.onclick = () => {
    closeModal();
    if (typeof onConfirm === "function") onConfirm();
  };
}

// SVG Icons Catalog
const CS_ICONS = {
  logo: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  search: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
  wishlist: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
  messages: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
  bell: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
  plus: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  chevronDown: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="cs-dropdown-chevron"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
  menu: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`,
  close: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  leaf: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>`
};

// Global Navbar Header Render / Bindings
function initNavbar() {
  const headerContainer = document.getElementById("navbar") || document.getElementById("site-header");
  if (!headerContainer) return;

  const currentUser = getCurrentUser();
  const wishlist = getWishlist();
  const unreadNotifs = typeof getUnreadNotificationCount === "function" ? getUnreadNotificationCount() : 0;
  const conversations = typeof getConversations === "function" ? getConversations() : [];

  // Route active detector
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const urlParams = new URLSearchParams(window.location.search);
  const currentType = urlParams.get("type") || urlParams.get("category");

  function isNavActive(pageKey) {
    if (pageKey === "home") {
      return (currentPath === "index.html" || currentPath === "" || currentPath === "/") ? "active" : "";
    }
    if (pageKey === "donate") {
      return (currentType === "donate") ? "active" : "";
    }
    if (pageKey === "lend") {
      return (currentType === "lend") ? "active" : "";
    }
    if (pageKey === "exchange") {
      return (currentType === "exchange") ? "active" : "";
    }
    if (pageKey === "explore") {
      return (currentPath === "explore.html" && !["donate", "lend", "exchange"].includes(currentType)) ? "active" : "";
    }
    return "";
  }

  const userInitial = currentUser ? (currentUser.name || "U").charAt(0).toUpperCase() : "U";

  headerContainer.innerHTML = `
    <div class="container">
      <!-- LEFT: CampusShare Logo -->
      <a href="${getAppUrl('index.html')}" class="cs-logo">
        <div class="cs-logo-icon">
          ${CS_ICONS.logo}
        </div>
        <div class="cs-logo-text-group">
          <div class="cs-logo-title">
            CampusShare<span class="cs-logo-dot"></span>
          </div>
          <div class="cs-logo-subtitle">BUY • SELL • LEND</div>
        </div>
      </a>

      <!-- CENTER: Main Navigation Links -->
      <nav class="cs-nav-center">
        <a href="${getAppUrl('index.html')}" class="cs-nav-item ${isNavActive('home')}">Home</a>
        <a href="${getAppUrl('explore.html')}" class="cs-nav-item ${isNavActive('explore')}">Explore</a>
        <a href="${getAppUrl('explore.html?type=donate')}" class="cs-nav-item ${isNavActive('donate')}">Donate</a>
        <a href="${getAppUrl('explore.html?type=lend')}" class="cs-nav-item ${isNavActive('lend')}">Lend</a>
        <a href="${getAppUrl('explore.html?type=exchange')}" class="cs-nav-item ${isNavActive('exchange')}">Exchange</a>
      </nav>

      <!-- RIGHT: Action Icons, Post CTA & Profile Dropdown -->
      <div class="cs-nav-right">
        <!-- Search Toggle Icon -->
        <button type="button" class="cs-icon-btn" id="cs-search-toggle-btn" title="Search Marketplace">
          ${CS_ICONS.search}
        </button>

        <!-- Wishlist Icon -->
        <a href="${getAppUrl('wishlist.html')}" class="cs-icon-btn" title="Wishlist">
          ${CS_ICONS.wishlist}
          <span class="cs-icon-badge" id="nav-wishlist-badge" style="${wishlist.length > 0 ? '' : 'display:none;'}">${wishlist.length}</span>
        </a>

        <!-- Messages Icon -->
        <a href="${getAppUrl('messages.html')}" class="cs-icon-btn" title="Messages">
          ${CS_ICONS.messages}
          <span class="cs-icon-badge" style="background-color: var(--purple); ${conversations.length > 0 ? '' : 'display:none;'}">${conversations.length}</span>
        </a>

        <!-- Notifications Bell Dropdown -->
        <div class="dropdown" id="notif-dropdown" style="position: relative;">
          <button type="button" class="cs-icon-btn" id="notif-dropdown-btn" title="Campus Notifications">
            ${CS_ICONS.bell}
            <span class="cs-icon-badge" id="nav-notif-badge" style="${unreadNotifs > 0 ? '' : 'display:none;'}">${unreadNotifs}</span>
          </button>
          <div class="dropdown-menu" id="notif-dropdown-menu" style="right: 0; min-width: 320px; max-width: 360px; padding: 0;">
            <div style="padding: 12px 16px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
              <strong style="color: var(--navy); font-size: 0.9rem;">Notifications</strong>
              <button type="button" id="notif-mark-read-btn" style="background: none; border: none; color: var(--blue); font-size: 0.75rem; font-weight: 600; cursor: pointer;">Mark all as read</button>
            </div>
            <div id="notif-items-list" style="max-height: 280px; overflow-y: auto;">
              <!-- Hydrated dynamically -->
            </div>
          </div>
        </div>

        <!-- Post an Item CTA Button -->
        <a href="${getAppUrl('post-item.html')}" class="cs-btn-post">
          ${CS_ICONS.plus}
          <span class="btn-text">Post an Item</span>
        </a>

        <!-- User Avatar & Dropdown -->
        ${currentUser ? `
          <div class="dropdown" id="user-dropdown">
            <button class="cs-user-dropdown-toggle" id="user-dropdown-btn" aria-label="User Menu">
              ${currentUser.avatar ? `<img src="${currentUser.avatar}" alt="${currentUser.name}" class="cs-user-avatar" referrerpolicy="no-referrer" />` : `<div style="width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, var(--navy), var(--blue)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem;">${userInitial}</div>`}
              ${CS_ICONS.chevronDown}
            </button>
            <div class="dropdown-menu" id="user-dropdown-menu">
              <div style="padding: 10px 16px; font-size: 0.825rem; color: var(--secondary-text); border-bottom: 1px solid var(--border);">
                Signed in as<br><strong style="color: var(--navy); font-size: 0.9rem;">${currentUser.name}</strong>
                ${currentUser.email ? `<div style="font-size: 0.775rem; color: var(--secondary-text); margin-top: 2px; word-break: break-all;">${currentUser.email}</div>` : ''}
              </div>
              <a href="${getAppUrl('profile.html')}" class="dropdown-item">👤 My Profile</a>
              <a href="${getAppUrl('my-listings.html')}" class="dropdown-item">📦 My Listings</a>
              <a href="${getAppUrl('wishlist.html')}" class="dropdown-item">❤️ Saved Wishlist</a>
              <a href="${getAppUrl('settings.html')}" class="dropdown-item">⚙️ Settings</a>
              <div class="dropdown-divider"></div>
              <a href="#" class="dropdown-item" id="logout-btn" style="color: var(--danger);">🚪 Log Out</a>
            </div>
          </div>
        ` : `
          <div style="display: flex; gap: 8px; align-items: center;">
            <a href="${getAppUrl('login.html')}" class="btn btn-outline btn-sm">Log In</a>
            <a href="${getAppUrl('register.html')}" class="btn btn-primary btn-sm">Register</a>
          </div>
        `}

        <!-- Mobile Hamburger Button -->
        <button class="mobile-toggle" id="mobile-menu-toggle" aria-label="Toggle Navigation">
          ${CS_ICONS.menu}
        </button>
      </div>

      <!-- Quick Search Overlay Form -->
      <form class="cs-search-overlay" id="cs-search-overlay-form">
        ${CS_ICONS.search}
        <input type="text" id="cs-search-overlay-input" placeholder="Search textbooks, notes, electronics, hostel gear..." />
        <button type="button" class="cs-icon-btn" id="cs-search-close-btn">
          ${CS_ICONS.close}
        </button>
      </form>
    </div>
  `;

  // Search Overlay Listeners
  const searchToggleBtn = document.getElementById("cs-search-toggle-btn");
  const searchCloseBtn = document.getElementById("cs-search-close-btn");
  const searchOverlayForm = document.getElementById("cs-search-overlay-form");
  const searchOverlayInput = document.getElementById("cs-search-overlay-input");

  if (searchToggleBtn && searchOverlayForm) {
    searchToggleBtn.addEventListener("click", function() {
      searchOverlayForm.classList.add("active");
      if (searchOverlayInput) searchOverlayInput.focus();
    });
  }

  if (searchCloseBtn && searchOverlayForm) {
    searchCloseBtn.addEventListener("click", function() {
      searchOverlayForm.classList.remove("active");
    });
  }

  if (searchOverlayForm) {
    searchOverlayForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const query = searchOverlayInput.value.trim();
      if (query) {
        window.location.href = getAppUrl(`explore.html?q=${encodeURIComponent(query)}`);
      }
    });
  }

  // User Dropdown Listener
  const dropdownBtn = document.getElementById("user-dropdown-btn");
  const dropdownMenu = document.getElementById("user-dropdown-menu");
  if (dropdownBtn && dropdownMenu) {
    dropdownBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      dropdownMenu.classList.toggle("show");
      const notifMenu = document.getElementById("notif-dropdown-menu");
      if (notifMenu) notifMenu.classList.remove("show");
    });
  }

  // Notifications Dropdown Listener
  const notifBtn = document.getElementById("notif-dropdown-btn");
  const notifMenu = document.getElementById("notif-dropdown-menu");
  if (notifBtn && notifMenu) {
    notifBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      notifMenu.classList.toggle("show");
      if (dropdownMenu) dropdownMenu.classList.remove("show");
      renderNotificationList();
    });
  }

  const markReadBtn = document.getElementById("notif-mark-read-btn");
  if (markReadBtn) {
    markReadBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      markNotificationsRead();
      renderNotificationList();
      updateHeaderNotifications();
      showToast("All notifications marked as read", "info");
    });
  }

  document.addEventListener("click", function() {
    if (dropdownMenu) dropdownMenu.classList.remove("show");
    if (notifMenu) notifMenu.classList.remove("show");
  });

  // Logout Listener
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async function(e) {
      e.preventDefault();
      try {
        if (window.supabaseClient) {
          await window.supabaseClient.auth.signOut();
        }
      } catch (err) {
        console.warn("Supabase sign out error:", err);
      }
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("sb-") && key.endsWith("-auth-token"))) {
          localStorage.removeItem(key);
        }
      }
      setCurrentUser(null);
      initNavbar();
      showToast("Signed out of CampusShare", "info");
      setTimeout(() => {
        window.location.href = getAppUrl("index.html");
      }, 400);
    });
  }
}

function updateHeaderNotifications() {
  const badge = document.getElementById("nav-notif-badge");
  if (badge && typeof getUnreadNotificationCount === "function") {
    const unread = getUnreadNotificationCount();
    badge.textContent = unread;
    badge.style.display = unread > 0 ? "inline-flex" : "none";
  }
}

function renderNotificationList() {
  const container = document.getElementById("notif-items-list");
  if (!container || typeof getNotifications !== "function") return;

  const notifs = getNotifications();
  if (notifs.length === 0) {
    container.innerHTML = `
      <div style="padding: 24px; text-align: center; color: var(--secondary-text); font-size: 0.85rem;">
        No notifications yet.<br>You're all caught up!
      </div>
    `;
    return;
  }

  container.innerHTML = notifs.map(n => `
    <div style="padding: 10px 16px; border-bottom: 1px solid #F1F5F9; background: ${n.unread ? '#F0F7FF' : 'white'}; cursor: pointer; transition: background 0.15s ease;" onclick="window.location.href='${getAppUrl(n.link)}'">
      <div style="display: flex; gap: 8px; align-items: flex-start;">
        <span style="font-size: 1.1rem; line-height: 1;">${n.icon || 'ℹ️'}</span>
        <div style="flex: 1;">
          <div style="font-size: 0.825rem; font-weight: ${n.unread ? '700' : '600'}; color: var(--navy);">${n.title}</div>
          <div style="font-size: 0.775rem; color: #4B5563; line-height: 1.4; margin-top: 2px;">${n.message}</div>
          <div style="font-size: 0.7rem; color: #9CA3AF; margin-top: 4px;">${n.date}</div>
        </div>
      </div>
    </div>
  `).join("");
}

// Global Footer Render
function initFooter() {
  const footerContainer = document.getElementById("footer") || document.getElementById("site-footer");
  if (!footerContainer) return;

  footerContainer.innerHTML = `
    <div class="container">
      <div class="footer-top-grid">
        <!-- CampusShare Brand & Description Column -->
        <div class="footer-brand-col">
          <a href="${getAppUrl('index.html')}" class="cs-logo">
            <div class="cs-logo-icon">
              ${CS_ICONS.logo}
            </div>
            <div class="cs-logo-text-group">
              <div class="cs-logo-title" style="color: var(--white);">
                CampusShare<span class="cs-logo-dot"></span>
              </div>
              <div class="cs-logo-subtitle" style="color: rgba(255, 255, 255, 0.5);">BUY • SELL • LEND</div>
            </div>
          </a>

          <p class="footer-description">
            CampusShare is the student-driven marketplace for buying, selling, donating, lending, and exchanging textbooks, notes, lab gear, and hostel essentials in Indian Rupees (₹).
          </p>

          <div class="footer-green-statement">
            ${CS_ICONS.leaf}
            <span>Less Waste • More Sharing • Stronger Campus Community</span>
          </div>
        </div>

        <!-- Column 1: MARKETPLACE -->
        <div>
          <h4 class="footer-col-title">MARKETPLACE</h4>
          <div class="footer-nav-list">
            <a href="${getAppUrl('explore.html')}">Explore All Items</a>
            <a href="${getAppUrl('explore.html?type=donate')}">Free Donations</a>
            <a href="${getAppUrl('explore.html?type=lend')}">Lend &amp; Borrow</a>
            <a href="${getAppUrl('explore.html?type=exchange')}">Item Exchange</a>
            <a href="${getAppUrl('post-item.html')}">Post a Listing</a>
          </div>
        </div>

        <!-- Column 2: SAFETY & TRUST -->
        <div>
          <h4 class="footer-col-title">SAFETY &amp; TRUST</h4>
          <div class="footer-nav-list">
            <a href="${getAppUrl('explore.html')}">Verified Campus Listings</a>
            <a href="${getAppUrl('index.html#how-it-works')}">How It Works</a>
            <a href="#">Safe Campus Meetups</a>
            <a href="#">Encrypted Student Chat</a>
            <a href="#">Community Guidelines</a>
          </div>
        </div>

        <!-- Column 3: USER ACCOUNT -->
        <div>
          <h4 class="footer-col-title">MY ACCOUNT</h4>
          <div class="footer-nav-list">
            <a href="${getAppUrl('profile.html')}">Student Profile</a>
            <a href="${getAppUrl('my-listings.html')}">My Listings</a>
            <a href="${getAppUrl('wishlist.html')}">Saved Wishlist</a>
            <a href="${getAppUrl('messages.html')}">Campus Messages</a>
            <a href="${getAppUrl('settings.html')}">Account Settings</a>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="footer-bottom-bar">
        <div>&copy; ${new Date().getFullYear()} CampusShare Inc. Built for student communities. All values in ₹ (INR).</div>
        <div style="display: flex; gap: 20px;">
          <a href="#" style="color: inherit; text-decoration: none;">Privacy Policy</a>
          <a href="#" style="color: inherit; text-decoration: none;">Terms of Service</a>
          <a href="#" style="color: inherit; text-decoration: none;">Campus Guidelines</a>
        </div>
      </div>
    </div>
  `;
}

// Mobile Nav Drawer Toggle
function initMobileDrawer() {
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  if (!toggleBtn) return;

  let overlay = document.querySelector(".mobile-nav-overlay");
  let drawer = document.querySelector(".mobile-nav-drawer");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "mobile-nav-overlay";
    document.body.appendChild(overlay);
  }

  if (!drawer) {
    drawer = document.createElement("div");
    drawer.className = "mobile-nav-drawer";
    
    drawer.innerHTML = `
      <div class="mobile-nav-header">
        <a href="${getAppUrl('index.html')}" class="cs-logo">
          <div class="cs-logo-icon">${CS_ICONS.logo}</div>
          <div class="cs-logo-text-group">
            <div class="cs-logo-title">CampusShare</div>
          </div>
        </a>
        <button class="cs-icon-btn" id="mobile-drawer-close-btn">${CS_ICONS.close}</button>
      </div>

      <div class="mobile-nav-links">
        <a href="${getAppUrl('index.html')}" class="cs-nav-item">🏠 Home</a>
        <a href="${getAppUrl('explore.html')}" class="cs-nav-item">🔍 Explore Marketplace</a>
        <a href="${getAppUrl('explore.html?type=donate')}" class="cs-nav-item">🎁 Free Donations</a>
        <a href="${getAppUrl('explore.html?type=lend')}" class="cs-nav-item">🤝 Lend &amp; Borrow</a>
        <a href="${getAppUrl('explore.html?type=exchange')}" class="cs-nav-item">🔄 Item Exchange</a>
        <div style="height: 1px; background: var(--border); margin: 8px 0;"></div>
        <a href="${getAppUrl('wishlist.html')}" class="cs-nav-item">❤️ Saved Wishlist</a>
        <a href="${getAppUrl('messages.html')}" class="cs-nav-item">💬 Messages</a>
        <a href="${getAppUrl('my-listings.html')}" class="cs-nav-item">📦 My Listings</a>
        <a href="${getAppUrl('profile.html')}" class="cs-nav-item">👤 Profile</a>
        <a href="${getAppUrl('settings.html')}" class="cs-nav-item">⚙️ Settings</a>
      </div>

      <div style="margin-top: auto; padding-top: 20px;">
        <a href="${getAppUrl('post-item.html')}" class="btn btn-primary btn-block btn-lg">Post an Item</a>
      </div>
    `;
    document.body.appendChild(drawer);
  }

  const closeBtn = document.getElementById("mobile-drawer-close-btn");

  toggleBtn.addEventListener("click", () => {
    overlay.classList.add("show");
    drawer.classList.add("open");
  });

  const closeDrawer = () => {
    overlay.classList.remove("show");
    drawer.classList.remove("open");
  };

  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);
}

// Update Wishlist Badge in Header
function updateHeaderWishlistCount() {
  const badge = document.getElementById("nav-wishlist-badge");
  if (badge) {
    const wishlist = getWishlist();
    badge.textContent = wishlist.length;
    badge.style.display = wishlist.length > 0 ? "inline-flex" : "none";
  }
}

// Global Nav Search Input Form Listener
function initNavSearch() {
  const searchForm = document.getElementById("nav-search-form");
  const searchInput = document.getElementById("nav-search-input");
  
  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = getAppUrl(`explore.html?q=${encodeURIComponent(query)}`);
      }
    });
  }
}

// Global Product Card HTML Generator Helper
function renderProductCard(item) {
  return renderListingCard(item);
}

// Global ListingCard HTML Generator (Figma design compliant with ₹ INR Currency)
function renderListingCard(item) {
  const wishlisted = isWishlisted(item.id);
  const type = (item.type || "sell").toLowerCase();
  
  let badgeLabel = "SELL";
  let badgeClass = "type-sell";
  if (type === "donate") {
    badgeLabel = "DONATE";
    badgeClass = "type-donate";
  } else if (type === "lend") {
    badgeLabel = "LEND";
    badgeClass = "type-lend";
  } else if (type === "exchange") {
    badgeLabel = "EXCHANGE";
    badgeClass = "type-exchange";
  }

  let priceText = item.priceDisplay || (item.price === 0 ? "FREE" : formatINR(item.price));
  let priceClass = "";
  if (type === "donate" || String(priceText).toUpperCase() === "FREE") {
    priceClass = "free";
  } else if (type === "lend") {
    priceClass = "lend";
  } else if (type === "exchange") {
    priceClass = "exchange";
  }

  const heartFill = wishlisted ? '#EF4444' : 'none';
  const heartStroke = wishlisted ? '#EF4444' : 'currentColor';
  const itemDetailsUrl = getAppUrl(`item-details.html?id=${encodeURIComponent(item.id)}`);
  const sellerInitial = (item.sellerName || "S").charAt(0).toUpperCase();
  const fallbackSvg = getCategoryPlaceholderSvg(item.category || "Other");

  return `
    <div class="hp-listing-card" data-id="${item.id}" onclick="if(!event.target.closest('.hp-listing-fav-btn') && !event.target.closest('a')) window.location.href='${itemDetailsUrl}'">
      <div class="hp-listing-img-wrap">
        <img src="${item.image || fallbackSvg}" alt="${item.title}" class="hp-listing-img" loading="lazy" onerror="this.src='${fallbackSvg}'" />
        <span class="hp-listing-type-badge ${badgeClass}">${badgeLabel}</span>
        <button class="hp-listing-fav-btn ${wishlisted ? 'active' : ''}" data-id="${item.id}" title="${wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}" onclick="handleWishlistClick(event, '${item.id}')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${heartFill}" stroke="${heartStroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
      <div class="hp-listing-body">
        <div class="hp-listing-top-row">
          <span class="hp-listing-category">${item.category}</span>
          <span class="hp-listing-condition">${item.condition}</span>
        </div>
        <a href="${itemDetailsUrl}" class="hp-listing-title" onclick="event.stopPropagation();">${item.title}</a>
        <div class="hp-listing-seller-row">
          <div class="hp-listing-seller-avatar">${sellerInitial}</div>
          <span class="hp-listing-seller-name">${item.sellerName}</span>
          <span class="hp-listing-seller-uni">🎓 ${item.sellerUniversity}</span>
          <span class="hp-listing-time">🕒 ${item.postedDate || 'Recent'}</span>
        </div>
        <div class="hp-listing-price-row">
          <span class="hp-listing-price ${priceClass}">${priceText}</span>
          <a href="${itemDetailsUrl}" class="hp-listing-view-btn" onclick="event.stopPropagation();">View Details</a>
        </div>
      </div>
    </div>
  `;
}

// Global Wishlist Button Click Handler
function handleWishlistClick(event, itemId) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  const added = toggleWishlist(itemId);
  updateHeaderWishlistCount();

  // Update all matching favorite buttons on the active page
  document.querySelectorAll(`.hp-listing-fav-btn[data-id="${itemId}"], .item-card-wishlist-btn[data-id="${itemId}"]`).forEach(btn => {
    if (added) {
      btn.classList.add("active");
      const svg = btn.querySelector("svg");
      if (svg) {
        svg.setAttribute("fill", "#EF4444");
        svg.setAttribute("stroke", "#EF4444");
      }
    } else {
      btn.classList.remove("active");
      const svg = btn.querySelector("svg");
      if (svg) {
        svg.setAttribute("fill", "none");
        svg.setAttribute("stroke", "currentColor");
      }
    }
  });

  if (added) {
    showToast("Added to your wishlist", "success");
  } else {
    showToast("Removed from wishlist", "info");
  }

  // Trigger event if wishlist page or other listeners need re-render
  document.dispatchEvent(new CustomEvent("wishlistUpdated", { detail: { itemId, added } }));
}
