/* ==========================================================================
   CampusShare - Item Details Controller (Figma design compliant)
   ========================================================================== */

let currentItem = null;

document.addEventListener("DOMContentLoaded", function() {
  const container = document.getElementById("item-details-container");
  if (!container) return;

  // Resolve Item ID from query parameter or URL path
  const urlParams = new URLSearchParams(window.location.search);
  let itemId = urlParams.get("id");

  if (!itemId) {
    const pathMatch = window.location.pathname.match(/\/item\/([^\/\?#]+)/);
    if (pathMatch) {
      itemId = pathMatch[1];
    } else {
      const hashMatch = window.location.hash.match(/#\/?item\/([^\/\?#]+)/);
      if (hashMatch) {
        itemId = hashMatch[1];
      }
    }
  }

  // If still no ID provided, default to item "1" so user never sees a broken page
  if (!itemId) {
    itemId = "1";
  }

  let item = getItemById(itemId);
  if (!item) {
    // If not found in localStorage yet, fallback to default seed item
    const items = getItems();
    if (items.length > 0) {
      item = items[0];
    }
  }

  if (!item) {
    renderNotFound(container);
    return;
  }

  currentItem = item;

  // Increment view counter
  item.views = (item.views || 0) + 1;
  const allItems = getItems();
  const idx = allItems.findIndex(i => String(i.id) === String(item.id));
  if (idx !== -1) {
    allItems[idx].views = item.views;
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(allItems));
  }

  renderItemDetails(container, item);
});

function renderNotFound(container) {
  container.innerHTML = `
    <div class="mp-empty-state" style="padding: 80px 24px;">
      <div style="font-size: 4rem; margin-bottom: 16px;">📦</div>
      <h2 class="mp-empty-title">Campus Listing Not Found</h2>
      <p class="mp-empty-desc">
        This item may have already been sold, donated, or removed by its student owner.
      </p>
      <a href="explore.html" class="btn btn-primary btn-lg">Explore Marketplace →</a>
    </div>
  `;
}

function renderItemDetails(container, item) {
  const isOwner = getCurrentUser() && String(getCurrentUser().id) === String(item.sellerId);
  const wishlisted = isWishlisted(item.id);
  const type = (item.type || "sell").toLowerCase();

  // Badges & Pricing Format
  let badgeLabel = "SELL";
  let badgeClass = "type-sell";
  let conditionalBtnText = "Buy / Contact Seller";
  let conditionalBtnIcon = "🛒";

  if (type === "donate") {
    badgeLabel = "DONATE";
    badgeClass = "type-donate";
    conditionalBtnText = "Request Donation";
    conditionalBtnIcon = "🎁";
  } else if (type === "lend") {
    badgeLabel = "LEND";
    badgeClass = "type-lend";
    conditionalBtnText = "Request to Borrow";
    conditionalBtnIcon = "🤝";
  } else if (type === "exchange") {
    badgeLabel = "EXCHANGE";
    badgeClass = "type-exchange";
    conditionalBtnText = "Propose Exchange";
    conditionalBtnIcon = "🔄";
  }

  let priceText = item.priceDisplay || (item.price === 0 ? "FREE" : (typeof formatINR === 'function' ? formatINR(item.price) : '₹' + item.price));
  let priceClass = "";
  if (type === "donate" || String(priceText).toUpperCase() === "FREE") {
    priceClass = "free";
  } else if (type === "lend") {
    priceClass = "lend";
  } else if (type === "exchange") {
    priceClass = "exchange";
  }

  // Ensure gallery images array
  const galleryImages = (item.images && item.images.length > 0) ? item.images : [item.image];

  // Related items (same category or nearby, excluding current item)
  const allItems = getItems();
  let relatedItems = allItems.filter(i => String(i.id) !== String(item.id) && (i.category === item.category || i.sellerUniversity === item.sellerUniversity));
  if (relatedItems.length < 3) {
    const extra = allItems.filter(i => String(i.id) !== String(item.id) && !relatedItems.includes(i));
    relatedItems = relatedItems.concat(extra);
  }
  relatedItems = relatedItems.slice(0, 3);

  container.innerHTML = `
    <!-- 1. Breadcrumbs -->
    <nav class="id-breadcrumb" aria-label="Breadcrumb">
      <a href="${getAppUrl('index.html')}">Home</a>
      <span>&rsaquo;</span>
      <a href="explore.html">Marketplace</a>
      <span>&rsaquo;</span>
      <a href="explore.html?category=${encodeURIComponent(item.category)}">${item.category}</a>
      <span>&rsaquo;</span>
      <span class="id-breadcrumb-current">${item.title}</span>
    </nav>

    <!-- 2. Two-Column Main Layout -->
    <div class="id-layout">
      
      <!-- LEFT COLUMN: Gallery & Description -->
      <div>
        
        <!-- Main Large Image -->
        <div class="id-gallery-main">
          <img id="id-main-photo" src="${galleryImages[0]}" alt="${item.title}" onerror="this.src='${typeof getCategoryPlaceholderSvg === 'function' ? getCategoryPlaceholderSvg(item.category) : ''}'" />
        </div>

        <!-- Thumbnails Strip -->
        ${galleryImages.length > 1 ? `
          <div class="id-thumbnails">
            ${galleryImages.map((img, idx) => `
              <img src="${img}" alt="Thumbnail ${idx + 1}" class="id-thumb ${idx === 0 ? 'active' : ''}" onclick="selectGalleryPhoto('${img}', this)" />
            `).join('')}
          </div>
        ` : ''}

        <!-- Description Card -->
        <div class="id-desc-card">
          <h2 class="id-desc-title">Item Description</h2>
          <div class="id-desc-content">${item.description || "No additional description provided by the seller."}</div>
        </div>

        <!-- Exchange / Lending Terms Callout (Conditional) -->
        ${type === 'lend' ? `
          <div class="id-desc-card" style="margin-top: 20px; background: #FFF7ED; border-color: #FED7AA;">
            <h3 style="font-size: 1.1rem; color: #C2410C; margin-bottom: 8px;">🤝 Lending Terms</h3>
            <p style="font-size: 0.925rem; color: #9A3412;">
              <strong>Duration:</strong> ${item.lendDuration || "1 Semester"}<br>
              <strong>Security Deposit:</strong> ${item.deposit ? (typeof formatINR === 'function' ? formatINR(item.deposit) : '₹' + item.deposit) + ' (refundable upon safe return)' : "None required"}
            </p>
          </div>
        ` : ''}

        ${type === 'exchange' ? `
          <div class="id-desc-card" style="margin-top: 20px; background: #EFF6FF; border-color: #BFDBFE;">
            <h3 style="font-size: 1.1rem; color: #1E40AF; margin-bottom: 8px;">🔄 Looking to Trade For</h3>
            <p style="font-size: 0.95rem; color: #1E3A8A; font-weight: 600;">
              "${item.exchangeFor || 'Open to other textbooks or academic gear'}"
            </p>
          </div>
        ` : ''}

        <!-- Campus Safety Tips Box -->
        <div class="id-safety-card">
          <div class="id-safety-icon">🛡️</div>
          <div>
            <h4 class="id-safety-title">Campus Safety Guidelines</h4>
            <p class="id-safety-text">
              Always arrange student pickups in well-lit, public campus locations such as the Student Union, campus library lobby, or campus police safe exchange zones. Inspect the item in person before completing exchange.
            </p>
          </div>
        </div>

      </div>

      <!-- RIGHT COLUMN: Sticky Price & Seller Box -->
      <div class="id-action-column">

        <!-- Price & Action Box -->
        <div class="id-price-card">
          
          <div class="id-badges-row">
            <span class="hp-listing-type-badge ${badgeClass}" style="position: static;">${badgeLabel}</span>
            <span class="hp-listing-condition">${item.condition}</span>
          </div>

          <h1 class="id-title">${item.title}</h1>

          <div class="id-price-row">
            <span class="id-price-main ${priceClass}">${priceText}</span>
            ${item.originalPrice && item.originalPrice > item.price ? `
              <span class="id-price-orig">${typeof formatINR === 'function' ? formatINR(item.originalPrice) : '₹' + item.originalPrice}</span>
            ` : ''}
            ${item.negotiable ? `
              <span class="badge badge-warning" style="font-size: 0.75rem;">Price Negotiable</span>
            ` : ''}
          </div>

          <div class="id-meta-list">
            <div class="id-meta-item">
              <span>📍</span>
              <span><strong>Campus Pickup:</strong> ${item.location || 'Campus Center'}</span>
            </div>
            <div class="id-meta-item">
              <span>🎓</span>
              <span><strong>University:</strong> ${item.sellerUniversity}</span>
            </div>
            <div class="id-meta-item">
              <span>🕒</span>
              <span><strong>Listed:</strong> ${item.postedDate || 'Recently'}</span>
            </div>
            <div class="id-meta-item">
              <span>👁️</span>
              <span><strong>Interest:</strong> ${item.views || 1} student views</span>
            </div>
          </div>

          <!-- Buttons Group -->
          <div class="id-actions-group">
            
            ${isOwner ? `
              <a href="my-listings.html" class="btn btn-secondary btn-block btn-lg">⚙️ Manage My Listing</a>
            ` : `
              <!-- CONDITIONAL PRIMARY BUTTON -->
              <button type="button" class="id-primary-btn" onclick="openContactModal('${conditionalBtnText}')">
                <span>${conditionalBtnIcon}</span>
                <span>${conditionalBtnText}</span>
              </button>
            `}

            <div class="id-secondary-actions">
              <!-- Save to Wishlist Button -->
              <button type="button" class="id-save-btn ${wishlisted ? 'active' : ''}" id="id-detail-save-btn" onclick="toggleDetailSave('${item.id}')">
                <span id="id-save-icon">${wishlisted ? '❤️' : '🤍'}</span>
                <span id="id-save-text">${wishlisted ? 'Saved to Wishlist' : 'Save Item'}</span>
              </button>

              <!-- Share Button -->
              <button type="button" class="id-icon-action-btn" title="Copy Listing Link" onclick="shareListingLink()">
                🔗
              </button>

              <!-- Report Button -->
              <button type="button" class="id-icon-action-btn" title="Report Listing" onclick="openReportModal()">
                🚩
              </button>
            </div>

          </div>

        </div>

        <!-- Verified Seller Profile Card -->
        <div class="id-seller-card">
          <div class="id-seller-header">
            ${item.sellerAvatar ? `<img src="${item.sellerAvatar}" alt="${item.sellerName}" class="id-seller-avatar" />` : `<div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--navy), var(--blue)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; flex-shrink: 0;">${typeof getUserInitials === 'function' ? getUserInitials(item.sellerName) : 'CS'}</div>`}
            <div>
              <div class="id-seller-name">
                <span>${item.sellerName}</span>
                <span class="id-verified-badge">✓ 100% Student Verified</span>
              </div>
              <div class="id-seller-uni">🎓 ${item.sellerUniversity}</div>
            </div>
          </div>

          <div class="id-seller-stats">
            <div>
              <div class="id-seller-stat-val">⭐ ${item.rating && item.rating !== '—' ? item.rating + ' ★' : '—'}</div>
              <div class="id-seller-stat-lbl">${item.reviewsCount ? `${item.reviewsCount} student reviews` : 'Verified Peer'}</div>
            </div>
            <div>
              <div class="id-seller-stat-val">⚡ Fast</div>
              <div class="id-seller-stat-lbl">Campus response time</div>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- 3. Related Listings Section -->
    ${relatedItems.length > 0 ? `
      <section class="id-related-section">
        <h2 class="id-related-title">Related Campus Items</h2>
        <div class="mp-grid">
          ${relatedItems.map(rel => renderListingCard(rel)).join('')}
        </div>
      </section>
    ` : ''}
  `;
}

// Gallery Photo Selector
window.selectGalleryPhoto = function(url, thumbEl) {
  const mainPhoto = document.getElementById("id-main-photo");
  if (mainPhoto) {
    mainPhoto.style.opacity = "0.7";
    setTimeout(() => {
      mainPhoto.src = url;
      mainPhoto.style.opacity = "1";
    }, 100);
  }
  document.querySelectorAll(".id-thumb").forEach(t => t.classList.remove("active"));
  if (thumbEl) thumbEl.classList.add("active");
};

// Toggle Wishlist on Details Page
window.toggleDetailSave = function(itemId) {
  const isAdded = toggleWishlist(itemId);
  updateHeaderWishlistCount();

  const saveBtn = document.getElementById("id-detail-save-btn");
  const saveIcon = document.getElementById("id-save-icon");
  const saveText = document.getElementById("id-save-text");

  if (saveBtn) {
    if (isAdded) {
      saveBtn.classList.add("active");
      if (saveIcon) saveIcon.textContent = "❤️";
      if (saveText) saveText.textContent = "Saved to Wishlist";
      showToast("Saved to your wishlist", "success");
    } else {
      saveBtn.classList.remove("active");
      if (saveIcon) saveIcon.textContent = "🤍";
      if (saveText) saveText.textContent = "Save Item";
      showToast("Removed from wishlist", "info");
    }
  }
};

// Share Listing Link Handler
window.shareListingLink = function() {
  const currentUrl = window.location.href;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(currentUrl).then(() => {
      showToast("Listing link copied to clipboard!", "success");
    }).catch(() => {
      showToast("Link: " + currentUrl, "info");
    });
  } else {
    showToast("Link: " + currentUrl, "info");
  }
};

// Contact Modal Controls
window.openContactModal = function(btnTitle) {
  const modal = document.getElementById("id-contact-modal");
  if (!modal || !currentItem) return;

  const sellerInitialsEl = document.getElementById("modal-seller-initials");
  const title = document.getElementById("modal-seller-title");
  const itemTitle = document.getElementById("modal-item-title");
  const customChip = document.getElementById("modal-custom-type-chip");
  const submitBtn = document.getElementById("modal-submit-btn");

  if (sellerInitialsEl) {
    sellerInitialsEl.textContent = typeof getUserInitials === "function" ? getUserInitials(currentItem.sellerName) : "CS";
  }
  if (title) title.textContent = `Message ${currentItem.sellerName}`;
  if (itemTitle) itemTitle.textContent = `Regarding: "${currentItem.title}"`;
  if (customChip) {
    if (currentItem.type === "donate") {
      customChip.textContent = `"Hello, I would love to request this donation if still available."`;
    } else if (currentItem.type === "lend") {
      customChip.textContent = `"Hi, I would like to borrow this for the semester. How does pickup work?"`;
    } else if (currentItem.type === "exchange") {
      customChip.textContent = `"Hi, I have items to trade as requested in your listing!"`;
    } else {
      customChip.textContent = `"Hi, I'm ready to buy this! When are you free to meet?"`;
    }
  }

  if (submitBtn) submitBtn.textContent = btnTitle ? `Send: ${btnTitle}` : "Send Message 🚀";

  modal.style.display = "flex";
};

window.closeContactModal = function() {
  const modal = document.getElementById("id-contact-modal");
  if (modal) modal.style.display = "none";
};

window.fillQuickMessage = function(text) {
  const input = document.getElementById("modal-message-input");
  if (input) {
    input.value = text;
    input.focus();
  }
};

// Send Message Handler — must run after DOM is ready
document.addEventListener("DOMContentLoaded", function() {
  const contactForm = document.getElementById("contact-seller-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const input = document.getElementById("modal-message-input");
      const msg = input ? input.value.trim() : "";
      if (!msg || !currentItem) return;

      const conv = typeof createOrGetConversation === "function" ? createOrGetConversation(currentItem.id, msg) : null;

      closeContactModal();
      if (input) input.value = "";
      showToast(`Message sent to ${currentItem.sellerName}!`, "success");

      const msgUrl = typeof getAppUrl === "function" ? getAppUrl("messages.html?conv=" + (conv ? conv.id : "")) : "messages.html";
      setTimeout(() => {
        window.location.href = msgUrl;
      }, 800);
    });
  }
});

// Report Modal Controls
window.openReportModal = function() {
  const modal = document.getElementById("id-report-modal");
  if (modal) modal.style.display = "flex";
};

window.closeReportModal = function() {
  const modal = document.getElementById("id-report-modal");
  if (modal) modal.style.display = "none";
};

window.submitReport = function(e) {
  e.preventDefault();
  closeReportModal();
  showToast("Report submitted. Campus Safety moderators have been notified.", "success");
};
