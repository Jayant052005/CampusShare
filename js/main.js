/* ==========================================================================
   CampusShare - Main Global Controller
   ========================================================================== */

// Smart URL routing helper for multi-folder structure
function getAppUrl(pageWithQuery) {
  const isInSubfolder = window.location.pathname.includes("/html/");
  
  let page = pageWithQuery;
  let query = "";
  if (pageWithQuery.includes("?")) {
    const parts = pageWithQuery.split("?");
    page = parts[0];
    query = "?" + parts[1];
  }

  if (page === "index.html") {
    return (isInSubfolder ? "../index.html" : "index.html") + query;
  }

  return (isInSubfolder ? page : `html/${page}`) + query;
}

document.addEventListener("DOMContentLoaded", function() {
  initNavbar();
  initFooter();
  initMobileDrawer();
  updateHeaderWishlistCount();
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
          <span class="cs-icon-badge" style="background-color: var(--purple);">2</span>
        </a>

        <!-- Notifications Bell Icon -->
        <button type="button" class="cs-icon-btn" title="Notifications" onclick="showToast('You have 1 new campus price update', 'info')">
          ${CS_ICONS.bell}
          <span class="cs-icon-dot-badge"></span>
        </button>

        <!-- Post an Item CTA Button -->
        <a href="${getAppUrl('post-item.html')}" class="cs-btn-post">
          ${CS_ICONS.plus}
          <span class="btn-text">+ Post an Item</span>
        </a>

        <!-- User Avatar & Dropdown -->
        ${currentUser ? `
          <div class="dropdown" id="user-dropdown">
            <button class="cs-user-dropdown-toggle" id="user-dropdown-btn" aria-label="User Menu">
              <img src="${currentUser.avatar}" alt="${currentUser.name}" class="cs-user-avatar" />
              ${CS_ICONS.chevronDown}
            </button>
            <div class="dropdown-menu" id="user-dropdown-menu">
              <div style="padding: 10px 16px; font-size: 0.825rem; color: var(--secondary-text); border-bottom: 1px solid var(--border);">
                Signed in as<br><strong style="color: var(--navy); font-size: 0.9rem;">${currentUser.name}</strong>
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
        <input type="text" id="cs-search-overlay-input" placeholder="Search textbooks, dorm gear, electronics..." />
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

  // Dropdown Listener
  const dropdownBtn = document.getElementById("user-dropdown-btn");
  const dropdownMenu = document.getElementById("user-dropdown-menu");
  if (dropdownBtn && dropdownMenu) {
    dropdownBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      dropdownMenu.classList.toggle("show");
    });
    document.addEventListener("click", function() {
      dropdownMenu.classList.remove("show");
    });
  }

  // Logout Listener
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function(e) {
      e.preventDefault();
      logoutUser();
      showToast("Logged out successfully", "info");
      setTimeout(() => {
        window.location.href = getAppUrl("index.html");
      }, 400);
    });
  }
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
            CampusShare is the trustworthy student-driven marketplace for buying, selling, donating, lending, and exchanging textbooks, notes, lab gear, and dorm essentials.
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
            <a href="#">Verified Student Status</a>
            <a href="${getAppUrl('index.html#how-it-works')}">How It Works</a>
            <a href="#">Safe Campus Meetups</a>
            <a href="#">Reviews &amp; Ratings</a>
            <a href="#">Report Suspicious Item</a>
          </div>
        </div>

        <!-- Column 3: CAMPUSSHARE -->
        <div>
          <h4 class="footer-col-title">CAMPUSSHARE</h4>
          <div class="footer-nav-list">
            <a href="#">About Our Mission</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact Campus Team</a>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="footer-bottom-bar">
        <div>&copy; ${new Date().getFullYear()} CampusShare Inc. Built for university communities.</div>
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
    const currentUser = getCurrentUser();
    drawer = document.createElement("div");
    drawer.className = "mobile-nav-drawer";
    
    // Route active detector for mobile menu
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const urlParams = new URLSearchParams(window.location.search);
    const currentType = urlParams.get("type") || urlParams.get("category");

    const isNavActive = (key) => {
      if (key === "home") return (currentPath === "index.html" || currentPath === "" || currentPath === "/") ? "active" : "";
      if (key === "donate") return (currentType === "donate") ? "active" : "";
      if (key === "lend") return (currentType === "lend") ? "active" : "";
      if (key === "exchange") return (currentType === "exchange") ? "active" : "";
      if (key === "explore") return (currentPath === "explore.html" && !["donate", "lend", "exchange"].includes(currentType)) ? "active" : "";
      return "";
    };

    drawer.innerHTML = `
      <div class="mobile-nav-header">
        <a href="${getAppUrl('index.html')}" class="cs-logo">
          <div class="cs-logo-icon" style="width: 36px; height: 36px;">
            ${CS_ICONS.logo}
          </div>
          <div class="cs-logo-text-group">
            <div class="cs-logo-title" style="font-size: 1.15rem;">
              CampusShare<span class="cs-logo-dot"></span>
            </div>
          </div>
        </a>
        <button id="close-mobile-drawer" class="cs-icon-btn">
          ${CS_ICONS.close}
        </button>
      </div>

      <div class="mobile-nav-links">
        <a href="${getAppUrl('index.html')}" class="cs-nav-item ${isNavActive('home')}">🏠 Home</a>
        <a href="${getAppUrl('explore.html')}" class="cs-nav-item ${isNavActive('explore')}">🔍 Explore Marketplace</a>
        <a href="${getAppUrl('explore.html?type=donate')}" class="cs-nav-item ${isNavActive('donate')}">🎁 Free Donations</a>
        <a href="${getAppUrl('explore.html?type=lend')}" class="cs-nav-item ${isNavActive('lend')}">🤝 Lend &amp; Borrow</a>
        <a href="${getAppUrl('explore.html?type=exchange')}" class="cs-nav-item ${isNavActive('exchange')}">🔄 Item Exchange</a>
        <a href="${getAppUrl('wishlist.html')}" class="cs-nav-item">❤️ Wishlist</a>
        <a href="${getAppUrl('messages.html')}" class="cs-nav-item">💬 Messages</a>
        
        <div style="height: 1px; background: var(--border); margin: 12px 0;"></div>

        ${currentUser ? `
          <a href="${getAppUrl('post-item.html')}" class="cs-btn-post" style="justify-content: center; width: 100%;">+ Post an Item</a>
          <a href="${getAppUrl('profile.html')}" class="cs-nav-item mt-sm">👤 My Profile</a>
          <a href="${getAppUrl('my-listings.html')}" class="cs-nav-item">📦 My Listings</a>
          <a href="${getAppUrl('settings.html')}" class="cs-nav-item">⚙️ Settings</a>
        ` : `
          <a href="${getAppUrl('login.html')}" class="btn btn-outline btn-block mt-md">Log In</a>
          <a href="${getAppUrl('register.html')}" class="btn btn-primary btn-block mt-sm">Register</a>
        `}
      </div>
    `;
    document.body.appendChild(drawer);
  }

  const closeBtn = document.getElementById("close-mobile-drawer");

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
  const wishlisted = isWishlisted(item.id);
  const formattedPrice = item.price === 0 ? "Free" : `$${item.price.toFixed(2)}`;
  const itemDetailsUrl = getAppUrl(`item-details.html?id=${item.id}`);

  return `
    <div class="item-card" data-id="${item.id}">
      <div class="item-card-image">
        <img src="${item.image}" alt="${item.title}" loading="lazy" />
        <button class="item-card-wishlist-btn ${wishlisted ? 'active' : ''}" 
                onclick="handleWishlistClick(event, '${item.id}')" 
                title="${wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}">
          ${wishlisted ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="item-card-body">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="item-card-category">${item.category}</span>
          <span class="badge badge-neutral" style="font-size: 0.7rem;">${item.condition}</span>
        </div>
        <h4 class="item-card-title">
          <a href="${itemDetailsUrl}">${item.title}</a>
        </h4>
        <div class="item-card-meta">
          <span>📍 ${item.sellerUniversity.split(' ')[0]}</span>
          <span>🕒 ${item.postedDate}</span>
        </div>
        <div class="item-card-price-row">
          <div class="item-card-price">${formattedPrice}</div>
          <a href="${itemDetailsUrl}" class="btn btn-outline btn-sm">View Details</a>
        </div>
      </div>
    </div>
  `;
}

// Global Wishlist Button Click Handler
function handleWishlistClick(event, itemId) {
  event.preventDefault();
  event.stopPropagation();
  const added = toggleWishlist(itemId);
  updateHeaderWishlistCount();

  const btn = event.currentTarget;
  if (added) {
    btn.classList.add("active");
    btn.innerHTML = "❤️";
    showToast("Added to your wishlist", "success");
  } else {
    btn.classList.remove("active");
    btn.innerHTML = "🤍";
    showToast("Removed from wishlist", "info");
  }

  // Trigger event if wishlist page needs re-render
  document.dispatchEvent(new CustomEvent("wishlistUpdated", { detail: { itemId, added } }));
}
