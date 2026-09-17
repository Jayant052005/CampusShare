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

// Global Navbar Header Render / Bindings
function initNavbar() {
  const headerContainer = document.getElementById("site-header");
  if (!headerContainer) return;

  const currentUser = getCurrentUser();
  const wishlist = getWishlist();
  const currentPath = window.location.pathname.split("/").pop() || "index.html";

  const isNavActive = (page) => currentPath === page ? "active" : "";

  headerContainer.innerHTML = `
    <div class="container">
      <a href="${getAppUrl('index.html')}" class="brand-logo">
        <div class="brand-icon">C</div>
        Campus<span>Share</span>
      </a>

      <form class="nav-search" id="nav-search-form">
        <span class="nav-search-icon">🔍</span>
        <input type="text" id="nav-search-input" placeholder="Search textbooks, tech, dorm gear..." />
      </form>

      <nav class="main-nav">
        <div class="nav-links">
          <a href="${getAppUrl('explore.html')}" class="nav-link ${isNavActive('explore.html')}">Explore</a>
          <a href="${getAppUrl('wishlist.html')}" class="nav-link ${isNavActive('wishlist.html')}">
            Wishlist
            <span class="badge-count" id="nav-wishlist-badge">${wishlist.length}</span>
          </a>
          <a href="${getAppUrl('messages.html')}" class="nav-link ${isNavActive('messages.html')}">Messages</a>
        </div>

        ${currentUser ? `
          <a href="${getAppUrl('post-item.html')}" class="btn btn-primary btn-sm">+ Post Item</a>
          <div class="dropdown" id="user-dropdown">
            <button class="btn btn-ghost" id="user-dropdown-btn" style="padding: 4px 8px;">
              <img src="${currentUser.avatar}" alt="${currentUser.name}" class="avatar avatar-sm" />
              <span style="font-size: 0.9rem; font-weight: 600; color: var(--navy);">${currentUser.name.split(' ')[0]}</span>
              <span style="font-size: 0.75rem;">▼</span>
            </button>
            <div class="dropdown-menu" id="user-dropdown-menu">
              <div style="padding: 8px 16px; font-size: 0.825rem; color: var(--secondary-text); border-bottom: 1px solid var(--border);">
                Signed in as<br><strong style="color: var(--navy); font-size: 0.9rem;">${currentUser.email}</strong>
              </div>
              <a href="${getAppUrl('profile.html')}" class="dropdown-item">👤 My Profile</a>
              <a href="${getAppUrl('my-listings.html')}" class="dropdown-item">📦 My Listings</a>
              <a href="${getAppUrl('settings.html')}" class="dropdown-item">⚙️ Settings</a>
              <div class="dropdown-divider"></div>
              <a href="#" class="dropdown-item" id="logout-btn" style="color: var(--danger);">🚪 Log Out</a>
            </div>
          </div>
        ` : `
          <div style="display: flex; gap: 8px;">
            <a href="${getAppUrl('login.html')}" class="btn btn-outline btn-sm">Log In</a>
            <a href="${getAppUrl('register.html')}" class="btn btn-primary btn-sm">Register</a>
          </div>
        `}
      </nav>

      <button class="mobile-toggle" id="mobile-menu-toggle" aria-label="Toggle Navigation">☰</button>
    </div>
  `;

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
      }, 500);
    });
  }
}

// Global Footer Render
function initFooter() {
  const footerContainer = document.getElementById("site-footer");
  if (!footerContainer) return;

  footerContainer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <a href="${getAppUrl('index.html')}" class="brand-logo" style="color: var(--white); margin-bottom: 1rem;">
            <div class="brand-icon">C</div>
            Campus<span style="color: var(--blue);">Share</span>
          </a>
          <p>The safe, trusted peer-to-peer campus marketplace designed exclusively for college students. Buy, sell, rent, and share textbooks, dorm essentials, electronics, and services with verified campus peers.</p>
        </div>
        <div class="footer-col">
          <h4>Marketplace</h4>
          <div class="footer-links">
            <a href="${getAppUrl('explore.html?category=textbooks')}">Textbooks & Notes</a>
            <a href="${getAppUrl('explore.html?category=electronics')}">Electronics & Tech</a>
            <a href="${getAppUrl('explore.html?category=dorm')}">Dorm Essentials</a>
            <a href="${getAppUrl('explore.html?category=services')}">Tutoring & Services</a>
            <a href="${getAppUrl('explore.html?category=sports')}">Bikes & Gear</a>
          </div>
        </div>
        <div class="footer-col">
          <h4>Account</h4>
          <div class="footer-links">
            <a href="${getAppUrl('profile.html')}">My Profile</a>
            <a href="${getAppUrl('my-listings.html')}">My Listings</a>
            <a href="${getAppUrl('post-item.html')}">Post a New Item</a>
            <a href="${getAppUrl('wishlist.html')}">Saved Items</a>
            <a href="${getAppUrl('messages.html')}">Messages</a>
          </div>
        </div>
        <div class="footer-col">
          <h4>Campus Safety</h4>
          <div class="footer-links">
            <a href="#">Student Verification</a>
            <a href="#">Safe Meeting Zones</a>
            <a href="#">Scam Prevention Tips</a>
            <a href="#">Community Guidelines</a>
            <a href="#">Support & FAQ</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div>&copy; ${new Date().getFullYear()} CampusShare Inc. Built for university communities.</div>
        <div style="display: flex; gap: 16px;">
          <a href="#" style="color: inherit;">Privacy Policy</a>
          <a href="#" style="color: inherit;">Terms of Service</a>
          <a href="#" style="color: inherit;">Campus Guidelines</a>
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
    drawer.innerHTML = `
      <div class="mobile-nav-header">
        <div class="brand-logo" style="font-size: 1.2rem;">
          <div class="brand-icon" style="width: 32px; height: 32px; font-size: 1rem;">C</div>
          Campus<span>Share</span>
        </div>
        <button id="close-mobile-drawer" style="background:none; border:none; font-size: 1.5rem; cursor:pointer;">✕</button>
      </div>
      <div class="mobile-nav-links">
        <a href="${getAppUrl('index.html')}" class="nav-link">🏠 Home</a>
        <a href="${getAppUrl('explore.html')}" class="nav-link">🔍 Explore Marketplace</a>
        <a href="${getAppUrl('wishlist.html')}" class="nav-link">❤️ Wishlist</a>
        <a href="${getAppUrl('messages.html')}" class="nav-link">💬 Messages</a>
        ${currentUser ? `
          <a href="${getAppUrl('post-item.html')}" class="btn btn-primary btn-block mt-md">+ Post Item</a>
          <a href="${getAppUrl('profile.html')}" class="nav-link mt-sm">👤 My Profile</a>
          <a href="${getAppUrl('my-listings.html')}" class="nav-link">📦 My Listings</a>
          <a href="${getAppUrl('settings.html')}" class="nav-link">⚙️ Settings</a>
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
