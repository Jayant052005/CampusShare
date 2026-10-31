/* ==========================================================================
   CampusShare - Unified Profile, Seller Dashboard & Settings Controller
   Strictly adheres to:
   - Currency: Indian Rupees (₹ INR) only
   - Clean SVG/Initials Avatars (NO fake portraits)
   - Interactive Tabs: My Listings, Saved, Transactions, Reviews
   - Seller Status Tabs: Active, Pending, Sold, Donated, Lent
   - Reusable Confirmation Modals for Destructive/Status Actions
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function() {
  if (typeof initStorage === "function") initStorage();

  if (document.getElementById("profile-header-content")) {
    initProfilePage();
  }
  if (document.getElementById("my-listings-container")) {
    initMyListingsPage();
  }
  if (document.getElementById("settings-unified-form")) {
    initSettingsPage();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. PROFILE PAGE
// ─────────────────────────────────────────────────────────────────────────────
function initProfilePage() {
  const headerContent = document.getElementById("profile-header-content");
  const tabContent = document.getElementById("profile-tab-content");
  const tabsNav = document.getElementById("profile-tabs-nav");
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;

  if (!user) {
    const loginUrl = typeof getAppUrl === "function" ? getAppUrl("login.html") : "login.html";
    const regUrl = typeof getAppUrl === "function" ? getAppUrl("register.html") : "register.html";

    if (headerContent) {
      headerContent.innerHTML = `
        <div style="text-align: center; padding: 48px 20px;">
          <div style="font-size: 3rem; margin-bottom: 12px;">👤</div>
          <h2 style="color: var(--navy); margin-bottom: 8px;">Sign In to CampusShare</h2>
          <p style="color: var(--secondary-text); max-width: 420px; margin: 0 auto 24px auto;">
            Log in or register with your verified student email (.edu) to access your campus profile, manage listings, and view saved items.
          </p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <a href="${loginUrl}" class="btn btn-outline" style="border-radius: 12px; padding: 10px 22px;">Log In</a>
            <a href="${regUrl}" class="btn btn-primary" style="border-radius: 12px; padding: 10px 22px;">Create Account</a>
          </div>
        </div>
      `;
    }
    if (tabContent) tabContent.innerHTML = "";
    return;
  }

  // Calculate real user stats
  const allItems = typeof getItems === "function" ? getItems() : [];
  const userItems = allItems.filter(item => item.sellerId === user.id || item.sellerName === user.name);
  const soldItems = userItems.filter(i => (i.status || "").toLowerCase() === "sold");
  const donatedItems = userItems.filter(i => (i.type || "").toLowerCase() === "donate" || (i.status || "").toLowerCase() === "donated");
  const lentItems = userItems.filter(i => (i.type || "").toLowerCase() === "lend" || (i.status || "").toLowerCase() === "lent");

  const wishlist = typeof getWishlist === "function" ? getWishlist() : [];
  const savedItems = allItems.filter(i => wishlist.includes(String(i.id)));
  const transactions = typeof getTransactions === "function" ? getTransactions() : [];
  const reviews = typeof getReviews === "function" ? getReviews() : [];

  // Update tab counters
  const countListingsEl = document.getElementById("profile-tab-listings-count");
  const countSavedEl = document.getElementById("profile-tab-saved-count");
  const countTransEl = document.getElementById("profile-tab-transactions-count");
  const countReviewsEl = document.getElementById("profile-tab-reviews-count");

  if (countListingsEl) countListingsEl.textContent = userItems.length;
  if (countSavedEl) countSavedEl.textContent = savedItems.length;
  if (countTransEl) countTransEl.textContent = transactions.length;
  if (countReviewsEl) countReviewsEl.textContent = reviews.length;

  const initials = typeof getUserInitials === "function" ? getUserInitials(user.name) : "CS";
  const settingsUrl = typeof getAppUrl === "function" ? getAppUrl("settings.html") : "settings.html";
  const postItemUrl = typeof getAppUrl === "function" ? getAppUrl("post-item.html") : "post-item.html";

  // Render Header Section
  if (headerContent) {
    headerContent.innerHTML = `
      <div class="profile-avatar-row">
        <div style="display: flex; align-items: flex-end; gap: 20px;">
          <div class="profile-avatar-large" style="position: relative; overflow: hidden; cursor: pointer;" title="Click to update profile picture" onclick="document.getElementById('profile-avatar-file-input')?.click()">
            ${user.avatar ? `<img src="${user.avatar}" alt="${user.name}" referrerpolicy="no-referrer" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />` : initials}
            <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(15, 23, 42, 0.75); color: white; font-size: 0.65rem; text-align: center; padding: 3px 0; font-weight: 600;">Update</div>
          </div>
          <input type="file" id="profile-avatar-file-input" accept="image/*" style="display: none;" />
          <div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <h1 style="color: var(--navy); font-size: 1.85rem; font-weight: 800; margin: 0;">${user.name}</h1>
              <span class="badge badge-success" style="font-size: 0.775rem;">✓ Verified Student</span>
            </div>
            ${user.email ? `<p style="color: var(--secondary-text); font-size: 0.9rem; margin: 2px 0 0 0;">✉️ ${user.email}</p>` : ''}
            <p style="color: var(--secondary-text); font-size: 0.95rem; margin: 4px 0 0 0;">
              🎓 <strong>${user.major || 'Undergraduate'}</strong> &bull; 🏫 ${user.university || 'Campus Member'}
            </p>
          </div>
        </div>

        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          <a href="${settingsUrl}" class="btn btn-outline" style="border-radius: 12px; font-weight: 600; padding: 9px 18px;">
            ⚙️ Edit Profile
          </a>
          <button type="button" id="profile-section-logout-btn" class="btn btn-outline" style="border-radius: 12px; font-weight: 600; padding: 9px 18px; color: var(--danger); border-color: var(--danger);">
            🚪 Log Out
          </button>
        </div>
      </div>

      <!-- Stats Strip (5 columns per prompt: Listings, Sold, Donated, Lent, Rating) -->
      <div class="profile-stats-strip">
        <div class="profile-stat-box">
          <div class="profile-stat-num">${userItems.length}</div>
          <div class="profile-stat-lbl">Listings</div>
        </div>
        <div class="profile-stat-box">
          <div class="profile-stat-num" style="color: #10B981;">${soldItems.length}</div>
          <div class="profile-stat-lbl">Sold</div>
        </div>
        <div class="profile-stat-box">
          <div class="profile-stat-num" style="color: #8B5CF6;">${donatedItems.length}</div>
          <div class="profile-stat-lbl">Donated</div>
        </div>
        <div class="profile-stat-box">
          <div class="profile-stat-num" style="color: var(--blue);">${lentItems.length}</div>
          <div class="profile-stat-lbl">Lent</div>
        </div>
        <div class="profile-stat-box">
          <div class="profile-stat-num" style="color: #F59E0B;">${user.rating || '5.0 ★'}</div>
          <div class="profile-stat-lbl">Rating</div>
        </div>
      </div>
    `;
  }

  // Bind Profile Section Logout Button
  const profLogoutBtn = document.getElementById("profile-section-logout-btn");
  if (profLogoutBtn) {
    profLogoutBtn.addEventListener("click", async function(e) {
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
        if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
          localStorage.removeItem(key);
        }
      }
      if (typeof setCurrentUser === "function") setCurrentUser(null);
      if (typeof initNavbar === "function") initNavbar();
      if (typeof showToast === "function") {
        showToast("Signed out of CampusShare", "info");
      }
      setTimeout(() => {
        window.location.href = (typeof getAppUrl === "function") ? getAppUrl("index.html") : "../index.html";
      }, 400);
    });
  }

  // Bind Profile Avatar File Input
  const avatarInput = document.getElementById("profile-avatar-file-input");
  if (avatarInput) {
    avatarInput.addEventListener("change", async function(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async function(evt) {
        const dataUrl = evt.target.result;
        let finalAvatarUrl = dataUrl;

        // Try uploading to Supabase Storage if bucket exists
        if (window.supabaseClient) {
          try {
            const ext = file.name.split('.').pop() || 'png';
            const filePath = `avatar_${user.id}_${Date.now()}.${ext}`;
            const { data: uploadData, error: uploadErr } = await window.supabaseClient.storage
              .from('avatars')
              .upload(filePath, file, { upsert: true });

            if (!uploadErr && uploadData?.path) {
              const { data: pubData } = window.supabaseClient.storage
                .from('avatars')
                .getPublicUrl(uploadData.path);
              if (pubData?.publicUrl) {
                finalAvatarUrl = pubData.publicUrl;
              }
            }
          } catch (storageErr) {
            console.log("Using dataUrl fallback for avatar:", storageErr);
          }

          // Update Supabase user metadata so it persists across devices and sessions
          try {
            await window.supabaseClient.auth.updateUser({
              data: { avatar_url: finalAvatarUrl, picture: finalAvatarUrl }
            });
          } catch (metaErr) {
            console.warn("Failed to update Supabase user metadata:", metaErr);
          }
        }

        user.avatar = finalAvatarUrl;
        if (typeof setCurrentUser === "function") setCurrentUser(user);
        if (typeof showToast === "function") {
          showToast("Profile picture updated successfully!", "success");
        }
        initProfilePage();
        if (typeof initNavbar === "function") initNavbar();
      };
      reader.readAsDataURL(file);
    });
  }

  // Active tab state
  let currentActiveTab = "listings";

  function renderActiveTab() {
    if (!tabContent) return;

    if (currentActiveTab === "listings") {
      if (userItems.length === 0) {
        tabContent.innerHTML = `
          <div style="text-align: center; padding: 56px 20px; background: var(--white); border-radius: 18px; border: 1px solid var(--border);">
            <div style="font-size: 3rem; margin-bottom: 12px;">📦</div>
            <h3 style="color: var(--navy); margin-bottom: 6px;">No Active Listings</h3>
            <p style="color: var(--secondary-text); max-width: 380px; margin: 0 auto 20px auto;">
              Clean out your dorm room or pass down last semester's textbooks to fellow campus students.
            </p>
            <a href="${postItemUrl}" class="btn btn-primary" style="border-radius: 12px;">+ Post an Item</a>
          </div>
        `;
      } else {
        tabContent.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="color: var(--navy); margin: 0; font-size: 1.25rem;">My Items for Campus Exchange</h3>
            <a href="${postItemUrl}" class="btn btn-primary btn-sm" style="border-radius: 10px;">+ Post Item</a>
          </div>
          <div class="grid-3">
            ${userItems.map(item => typeof renderListingCard === "function" ? renderListingCard(item) : "").join("")}
          </div>
        `;
      }
    } else if (currentActiveTab === "saved") {
      if (savedItems.length === 0) {
        const exploreUrl = typeof getAppUrl === "function" ? getAppUrl("explore.html") : "explore.html";
        tabContent.innerHTML = `
          <div style="text-align: center; padding: 56px 20px; background: var(--white); border-radius: 18px; border: 1px solid var(--border);">
            <div style="font-size: 3rem; margin-bottom: 12px;">❤️</div>
            <h3 style="color: var(--navy); margin-bottom: 6px;">No Saved Items Yet</h3>
            <p style="color: var(--secondary-text); max-width: 380px; margin: 0 auto 20px auto;">
              Explore textbooks, calculators, and lab gear across campus and save them to your wishlist.
            </p>
            <a href="${exploreUrl}" class="btn btn-primary" style="border-radius: 12px;">Explore Marketplace</a>
          </div>
        `;
      } else {
        tabContent.innerHTML = `
          <div class="grid-3">
            ${savedItems.map(item => typeof renderListingCard === "function" ? renderListingCard(item) : "").join("")}
          </div>
        `;
      }
    } else if (currentActiveTab === "transactions") {
      tabContent.innerHTML = `
        <div style="text-align: center; padding: 56px 20px; background: var(--white); border-radius: 18px; border: 1px solid var(--border);">
          <div style="font-size: 3rem; margin-bottom: 12px;">🤝</div>
          <h3 style="color: var(--navy); margin-bottom: 6px;">Campus Exchange History</h3>
          <p style="color: var(--secondary-text); max-width: 400px; margin: 0 auto;">
            Completed campus sales, borrowings, and book donations will be safely logged here after in-person exchanges.
          </p>
        </div>
      `;
    } else if (currentActiveTab === "reviews") {
      tabContent.innerHTML = `
        <div style="text-align: center; padding: 56px 20px; background: var(--white); border-radius: 18px; border: 1px solid var(--border);">
          <div style="font-size: 3rem; margin-bottom: 12px;">⭐</div>
          <h3 style="color: var(--navy); margin-bottom: 6px;">Peer Ratings &amp; Reviews</h3>
          <p style="color: var(--secondary-text); max-width: 420px; margin: 0 auto 16px auto;">
            Verified campus reviews from fellow students after completing safe meetups.
          </p>
          <span class="badge badge-success" style="padding: 6px 14px; font-size: 0.85rem;">
            100% Student Verified Reputation
          </span>
        </div>
      `;
    }
  }

  // Handle Tab Click
  if (tabsNav) {
    tabsNav.addEventListener("click", function(e) {
      const btn = e.target.closest(".cs-tab-btn");
      if (!btn) return;

      tabsNav.querySelectorAll(".cs-tab-btn").forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      currentActiveTab = btn.getAttribute("data-tab") || "listings";
      renderActiveTab();
    });
  }

  // Initial render
  renderActiveTab();
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. MY LISTINGS PAGE (SELLER DASHBOARD)
// ─────────────────────────────────────────────────────────────────────────────
function initMyListingsPage() {
  const container = document.getElementById("my-listings-container");
  const statusTabsNav = document.getElementById("listings-status-tabs");
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;

  if (!container) return;

  if (!user) {
    const loginUrl = typeof getAppUrl === "function" ? getAppUrl("login.html") : "login.html";
    const regUrl = typeof getAppUrl === "function" ? getAppUrl("register.html") : "register.html";
    container.innerHTML = `
      <div style="text-align: center; padding: 64px 20px; background: var(--white); border-radius: 18px; border: 1px solid var(--border);">
        <div style="font-size: 3.5rem; margin-bottom: 16px;">🔐</div>
        <h3 style="color: var(--navy); margin-bottom: 8px;">Authentication Required</h3>
        <p style="color: var(--secondary-text); max-width: 400px; margin: 0 auto 24px auto;">
          Please sign in to manage your campus marketplace listings.
        </p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <a href="${loginUrl}" class="btn btn-outline" style="border-radius: 12px; padding: 10px 22px;">Log In</a>
          <a href="${regUrl}" class="btn btn-primary" style="border-radius: 12px; padding: 10px 22px;">Create Account</a>
        </div>
      </div>
    `;
    return;
  }

  let activeStatusFilter = "active";

  function renderListingsDashboard() {
    const allItems = typeof getItems === "function" ? getItems() : [];
    const userItems = allItems.filter(item => item.sellerId === user.id || item.sellerName === user.name);

    // Tab counts
    const activeItems = userItems.filter(i => (i.status || "active").toLowerCase() === "active");
    const pendingItems = userItems.filter(i => (i.status || "").toLowerCase() === "pending");
    const soldItems = userItems.filter(i => (i.status || "").toLowerCase() === "sold");
    const donatedItems = userItems.filter(i => (i.type || "").toLowerCase() === "donate" || (i.status || "").toLowerCase() === "donated");
    const lentItems = userItems.filter(i => (i.type || "").toLowerCase() === "lend" || (i.status || "").toLowerCase() === "lent");

    const elActive = document.getElementById("status-count-active");
    const elPending = document.getElementById("status-count-pending");
    const elSold = document.getElementById("status-count-sold");
    const elDonated = document.getElementById("status-count-donated");
    const elLent = document.getElementById("status-count-lent");

    if (elActive) elActive.textContent = activeItems.length;
    if (elPending) elPending.textContent = pendingItems.length;
    if (elSold) elSold.textContent = soldItems.length;
    if (elDonated) elDonated.textContent = donatedItems.length;
    if (elLent) elLent.textContent = lentItems.length;

    // Filter by selected tab
    let displayItems = [];
    if (activeStatusFilter === "active") displayItems = activeItems;
    else if (activeStatusFilter === "pending") displayItems = pendingItems;
    else if (activeStatusFilter === "sold") displayItems = soldItems;
    else if (activeStatusFilter === "donated") displayItems = donatedItems;
    else if (activeStatusFilter === "lent") displayItems = lentItems;

    if (displayItems.length === 0) {
      const postUrl = typeof getAppUrl === "function" ? getAppUrl("post-item.html") : "post-item.html";
      container.innerHTML = `
        <div style="text-align: center; padding: 64px 20px; background: var(--white); border-radius: 18px; border: 1px solid var(--border);">
          <div style="font-size: 3.5rem; margin-bottom: 14px;">🏷️</div>
          <h3 style="color: var(--navy); margin-bottom: 6px;">No ${activeStatusFilter.toUpperCase()} listings</h3>
          <p style="color: var(--secondary-text); max-width: 400px; margin: 0 auto 20px auto;">
            You have no items marked as ${activeStatusFilter} in your campus seller dashboard.
          </p>
          <a href="${postUrl}" class="btn btn-primary" style="border-radius: 12px; font-weight: 700;">+ Post New Listing</a>
        </div>
      `;
      return;
    }

    container.innerHTML = displayItems.map(item => {
      const priceText = item.priceDisplay || (item.type === 'donate' ? 'FREE' : (typeof formatINR === 'function' ? formatINR(item.price) : '₹' + item.price));
      const detailUrl = typeof getAppUrl === "function" ? getAppUrl("item-details.html?id=" + item.id) : "item-details.html?id=" + item.id;
      const isPaused = (item.status || "").toLowerCase() === "paused";
      const isSold = (item.status || "").toLowerCase() === "sold";

      return `
        <div class="my-listing-row">
          <div class="my-listing-img-box">
            <img
              src="${item.image || (typeof getCategoryPlaceholderSvg === 'function' ? getCategoryPlaceholderSvg(item.category) : '')}"
              alt="${item.title}"
              class="my-listing-img"
            />
          </div>

          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
              <span class="badge ${item.type === 'donate' ? 'badge-donate' : (item.type === 'lend' ? 'badge-lend' : 'badge-sell')}" style="font-size: 0.75rem;">
                ${(item.type || 'SELL').toUpperCase()}
              </span>
              <span class="badge ${isSold ? 'badge-neutral' : (isPaused ? 'badge-warning' : 'badge-success')}" style="font-size: 0.75rem;">
                ${isSold ? 'SOLD' : (isPaused ? 'PAUSED' : 'ACTIVE')}
              </span>
            </div>

            <h3 style="margin: 0 0 4px 0; font-size: 1.05rem; font-weight: 700; color: var(--navy);">
              <a href="${detailUrl}" style="text-decoration: none; color: inherit;">${item.title}</a>
            </h3>

            <div style="font-size: 1.1rem; font-weight: 800; color: var(--blue);">
              ${priceText}
            </div>

            <div class="my-listing-meta-row">
              <span>👁️ ${item.views || 0} views</span>
              <span>❤️ ${item.favorites || 0} saves</span>
              <span>📅 Listed ${item.postedDate || 'recently'}</span>
              <span>📍 ${item.location || 'Campus'}</span>
            </div>
          </div>

          <!-- Actions per prompt: Edit, Delete, Mark as Sold, Pause Listing -->
          <div class="my-listing-actions">
            ${!isSold ? `
              <button type="button" class="btn btn-outline btn-sm" onclick="window.handleMarkSold('${item.id}')" style="border-radius: 8px;">
                Mark as Sold
              </button>
              <button type="button" class="btn btn-ghost btn-sm" onclick="window.handleTogglePause('${item.id}', ${isPaused})" style="border-radius: 8px;">
                ${isPaused ? 'Resume' : 'Pause'}
              </button>
            ` : `
              <button type="button" class="btn btn-outline btn-sm" onclick="window.handleReactivate('${item.id}')" style="border-radius: 8px;">
                Re-list Active
              </button>
            `}
            <a href="${detailUrl}" class="btn btn-ghost btn-sm" style="border-radius: 8px;">View</a>
            <button type="button" class="btn btn-danger btn-sm" onclick="window.handleDeleteListing('${item.id}')" style="border-radius: 8px;">
              Delete
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  // Bind Status Tabs Nav
  if (statusTabsNav) {
    statusTabsNav.addEventListener("click", function(e) {
      const btn = e.target.closest(".cs-tab-btn");
      if (!btn) return;

      statusTabsNav.querySelectorAll(".cs-tab-btn").forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      activeStatusFilter = btn.getAttribute("data-status") || "active";
      renderListingsDashboard();
    });
  }

  // Action Handlers using showConfirmModal
  window.handleMarkSold = function(itemId) {
    if (typeof showConfirmModal === "function") {
      showConfirmModal({
        title: "Mark Item as Sold",
        message: "Are you sure you want to mark this campus item as SOLD? It will move to your Sold records.",
        confirmText: "Mark as Sold",
        confirmClass: "btn-primary",
        onConfirm: () => {
          updateItemStatus(itemId, "sold");
          if (typeof showToast === "function") showToast("Item successfully marked as SOLD!", "success");
          renderListingsDashboard();
        }
      });
    } else {
      updateItemStatus(itemId, "sold");
      renderListingsDashboard();
    }
  };

  window.handleReactivate = function(itemId) {
    updateItemStatus(itemId, "active");
    if (typeof showToast === "function") showToast("Item restored to active marketplace!", "success");
    renderListingsDashboard();
  };

  window.handleTogglePause = function(itemId, currentlyPaused) {
    const nextStatus = currentlyPaused ? "active" : "paused";
    const msg = currentlyPaused ? "Resume this listing for student buyers?" : "Pause this listing? It will temporarily be hidden from search results.";

    if (typeof showConfirmModal === "function") {
      showConfirmModal({
        title: currentlyPaused ? "Resume Listing" : "Pause Listing",
        message: msg,
        confirmText: currentlyPaused ? "Resume" : "Pause",
        confirmClass: currentlyPaused ? "btn-primary" : "btn-warning",
        onConfirm: () => {
          updateItemStatus(itemId, nextStatus);
          if (typeof showToast === "function") showToast(currentlyPaused ? "Listing resumed as ACTIVE" : "Listing PAUSED", "info");
          renderListingsDashboard();
        }
      });
    } else {
      updateItemStatus(itemId, nextStatus);
      renderListingsDashboard();
    }
  };

  window.handleDeleteListing = function(itemId) {
    if (typeof showConfirmModal === "function") {
      showConfirmModal({
        title: "Delete Listing",
        message: "Are you sure you want to permanently delete this listing? This action cannot be undone.",
        confirmText: "Delete",
        confirmClass: "btn-danger",
        onConfirm: () => {
          deleteItem(itemId);
          if (typeof showToast === "function") showToast("Listing permanently deleted", "info");
          renderListingsDashboard();
        }
      });
    } else {
      deleteItem(itemId);
      renderListingsDashboard();
    }
  };

  // Initial render
  renderListingsDashboard();
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SETTINGS PAGE
// ─────────────────────────────────────────────────────────────────────────────
function initSettingsPage() {
  const form = document.getElementById("settings-unified-form");
  const navSidebar = document.querySelector(".settings-nav-sidebar");
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;

  if (!user) {
    const loginUrl = typeof getAppUrl === "function" ? getAppUrl("login.html") : "login.html";
    window.location.href = loginUrl;
    return;
  }

  // Pre-fill profile fields
  const nameInput = document.getElementById("settings-name");
  const uniInput = document.getElementById("settings-university");
  const majorInput = document.getElementById("settings-major");
  const bioInput = document.getElementById("settings-bio");
  const emailInput = document.getElementById("settings-email");

  if (nameInput) nameInput.value = user.name || "";
  if (uniInput) uniInput.value = user.university || "Stanford University";
  if (majorInput) majorInput.value = user.major || "";
  if (bioInput) bioInput.value = user.bio || "";
  if (emailInput) emailInput.value = user.email || "";

  // Settings Avatar Uploader
  const avatarPreview = document.getElementById("settings-avatar-preview");
  const avatarInput = document.getElementById("settings-avatar-input");
  let pendingAvatar = user.avatar || "";

  if (avatarPreview) {
    if (user.avatar) {
      avatarPreview.innerHTML = `<img src="${user.avatar}" alt="${user.name}" referrerpolicy="no-referrer" style="width: 100%; height: 100%; object-fit: cover;" />`;
    } else {
      avatarPreview.textContent = (user.name || "U").charAt(0).toUpperCase();
    }
  }

  if (avatarInput) {
    avatarInput.addEventListener("change", function(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async function(evt) {
        pendingAvatar = evt.target.result;
        if (avatarPreview) {
          avatarPreview.innerHTML = `<img src="${pendingAvatar}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;" />`;
        }
        if (window.supabaseClient) {
          try {
            const ext = file.name.split('.').pop() || 'png';
            const filePath = `avatar_${user.id}_${Date.now()}.${ext}`;
            const { data: uploadData, error: uploadErr } = await window.supabaseClient.storage
              .from('avatars')
              .upload(filePath, file, { upsert: true });

            if (!uploadErr && uploadData?.path) {
              const { data: pubData } = window.supabaseClient.storage
                .from('avatars')
                .getPublicUrl(uploadData.path);
              if (pubData?.publicUrl) {
                pendingAvatar = pubData.publicUrl;
              }
            }
          } catch (err) {}
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // Check URL param for tab
  const urlParams = new URLSearchParams(window.location.search);
  const targetTab = urlParams.get("tab") || "profile";
  switchSettingsTab(targetTab);

  function switchSettingsTab(tabKey) {
    // Nav buttons
    if (navSidebar) {
      navSidebar.querySelectorAll(".settings-nav-link").forEach(btn => {
        const isActive = btn.getAttribute("data-tab") === tabKey;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
      });
    }

    // Sections
    document.querySelectorAll(".settings-tab-section").forEach(sec => {
      sec.style.display = "none";
    });
    const activeSec = document.getElementById("settings-section-" + tabKey);
    if (activeSec) {
      activeSec.style.display = "block";
    }
  }

  if (navSidebar) {
    navSidebar.addEventListener("click", function(e) {
      const btn = e.target.closest(".settings-nav-link");
      if (!btn) return;
      const tab = btn.getAttribute("data-tab") || "profile";
      switchSettingsTab(tab);
    });
  }

  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();

      const updatedUser = {
        ...user,
        avatar: pendingAvatar,
        name: nameInput ? nameInput.value.trim() : user.name,
        university: uniInput ? uniInput.value : user.university,
        major: majorInput ? majorInput.value.trim() : user.major,
        bio: bioInput ? bioInput.value.trim() : user.bio,
        email: emailInput ? emailInput.value.trim() : user.email
      };

      setCurrentUser(updatedUser);

      // Sync editable profile details to Supabase Auth metadata
      if (window.supabaseClient) {
        window.supabaseClient.auth.updateUser({
          data: {
            full_name: updatedUser.name,
            university: updatedUser.university,
            major: updatedUser.major,
            bio: updatedUser.bio,
            avatar_url: updatedUser.avatar,
            picture: updatedUser.avatar
          }
        }).catch(err => console.warn("Supabase updateUser error:", err));
      }

      if (typeof showToast === "function") {
        showToast("Settings and preferences saved successfully!", "success");
      }

      const profileUrl = typeof getAppUrl === "function" ? getAppUrl("profile.html") : "profile.html";
      setTimeout(() => {
        window.location.href = profileUrl;
      }, 700);
    });
  }

  window.confirmSignOut = function() {
    if (typeof showConfirmModal === "function") {
      showConfirmModal("Sign Out", "Are you sure you want to sign out of CampusShare?", () => {
        if (typeof logoutUser === "function") logoutUser();
        if (typeof showToast === "function") showToast("Signed out successfully", "info");
        const loginUrl = typeof getAppUrl === "function" ? getAppUrl("login.html") : "login.html";
        setTimeout(() => {
          window.location.href = loginUrl;
        }, 500);
      });
    } else {
      if (typeof logoutUser === "function") logoutUser();
      const loginUrl = typeof getAppUrl === "function" ? getAppUrl("login.html") : "login.html";
      window.location.href = loginUrl;
    }
  };
}
