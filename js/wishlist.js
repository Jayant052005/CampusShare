/* ==========================================================================
   CampusShare - Wishlist Controller (Figma design compliant)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function() {
  initWishlistPage();

  // Listen to cross-component wishlist events
  document.addEventListener("wishlistUpdated", function() {
    renderWishlist();
  });
});

function initWishlistPage() {
  const container = document.getElementById("wl-grid");
  const countBadge = document.getElementById("wl-count-text");
  const clearBtn = document.getElementById("wl-clear-all-btn");
  const toolbar = document.getElementById("wl-toolbar");
  const notifyBtn = document.getElementById("wl-notify-toggle-btn");

  if (!container) return;

  // Toggle notification preference
  if (notifyBtn) {
    let notifyActive = localStorage.getItem("campus_share_notify_wishlist") === "true";
    updateNotifyButtonUI(notifyActive);

    notifyBtn.addEventListener("click", function() {
      notifyActive = !notifyActive;
      localStorage.setItem("campus_share_notify_wishlist", notifyActive ? "true" : "false");
      updateNotifyButtonUI(notifyActive);
      if (notifyActive) {
        showToast("Notifications enabled! You'll be alerted when similar campus items are posted.", "success");
      } else {
        showToast("Wishlist notifications disabled.", "info");
      }
    });
  }

  function updateNotifyButtonUI(isActive) {
    if (!notifyBtn) return;
    const icon = document.getElementById("wl-notify-icon");
    const text = document.getElementById("wl-notify-text");
    if (isActive) {
      notifyBtn.classList.add("active");
      if (icon) icon.textContent = "✓";
      if (text) text.textContent = "Alerts Active for Similar Items";
    } else {
      notifyBtn.classList.remove("active");
      if (icon) icon.textContent = "🔔";
      if (text) text.textContent = "Notify me when similar items are posted";
    }
  }

  // Clear All Wishlist
  if (clearBtn) {
    clearBtn.addEventListener("click", function() {
      const currentList = getWishlist();
      if (currentList.length === 0) return;

      if (confirm("Are you sure you want to remove all saved items from your wishlist?")) {
        localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify([]));
        updateHeaderWishlistCount();
        renderWishlist();
        showToast("Wishlist cleared", "info");
      }
    });
  }

  // Main Render Function
  window.renderWishlist = function() {
    const wishlistIds = getWishlist();
    const allItems = getItems();
    const wishlistedItems = allItems.filter(item => wishlistIds.includes(String(item.id)));

    if (countBadge) {
      countBadge.textContent = `${wishlistedItems.length} Saved Item${wishlistedItems.length === 1 ? '' : 's'}`;
    }

    if (toolbar) {
      toolbar.style.display = wishlistedItems.length > 0 ? "flex" : "none";
    }

    if (wishlistedItems.length === 0) {
      container.innerHTML = `
        <div class="mp-empty-state" style="padding: 72px 24px;">
          <div style="font-size: 4rem; margin-bottom: 16px;">❤️</div>
          <h2 class="mp-empty-title">Your Saved Wishlist is Empty</h2>
          <p class="mp-empty-desc">
            Browse textbooks, graphing calculators, lab gear, and hostel items on the campus marketplace. Tap the heart icon on any listing to save it here for quick access later.
          </p>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <a href="explore.html" class="btn btn-primary btn-lg">Explore Marketplace →</a>
          </div>
        </div>
      `;
      return;
    }

    // Render Saved Listing Cards matching the Figma design specifications
    container.innerHTML = wishlistedItems.map(item => {
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

      let priceText = item.priceDisplay || (item.price === 0 ? "FREE" : `$${item.price}`);
      let priceClass = "";
      if (type === "donate" || String(priceText).toUpperCase() === "FREE") {
        priceClass = "free";
      } else if (type === "lend") {
        priceClass = "lend";
      } else if (type === "exchange") {
        priceClass = "exchange";
      }

      const itemDetailsUrl = getAppUrl(`item-details.html?id=${encodeURIComponent(item.id)}`);

      return `
        <div class="wl-card" data-id="${item.id}">
          <div class="wl-img-wrap">
            <img src="${item.image}" alt="${item.title}" class="wl-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'" />
            <span class="hp-listing-type-badge ${badgeClass}">${badgeLabel}</span>
            <button type="button" class="wl-delete-btn" title="Remove from Wishlist" onclick="removeWishlistItem(event, '${item.id}')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
          <div class="wl-card-body">
            <div class="wl-card-meta">
              <span class="hp-listing-category">${item.category}</span>
              <span class="hp-listing-condition">${item.condition}</span>
            </div>
            <a href="${itemDetailsUrl}" class="wl-card-title">${item.title}</a>
            <div class="wl-card-uni">
              <span>🎓 ${item.sellerUniversity}</span>
            </div>
            <div class="wl-card-bottom">
              <span class="hp-listing-price ${priceClass}">${priceText}</span>
              <a href="${itemDetailsUrl}" class="wl-btn-view">View Item Details</a>
            </div>
          </div>
        </div>
      `;
    }).join("");
  };

  // Remove individual item with immediate animation
  window.removeWishlistItem = function(event, itemId) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const card = document.querySelector(`.wl-card[data-id="${itemId}"]`);
    if (card) {
      card.style.opacity = "0";
      card.style.transform = "scale(0.9)";
      card.style.transition = "all 0.25s ease";
    }

    setTimeout(() => {
      toggleWishlist(itemId);
      updateHeaderWishlistCount();
      renderWishlist();
      showToast("Removed from wishlist", "info");
    }, 200);
  };

  // Initial call
  renderWishlist();
}
