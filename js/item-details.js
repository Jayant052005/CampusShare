/* ==========================================================================
   CampusShare - Item Details Controller
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function() {
  const container = document.getElementById("item-details-container");
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("id");

  if (!itemId) {
    renderNotFound(container);
    return;
  }

  const item = getItemById(itemId);
  if (!item) {
    renderNotFound(container);
    return;
  }

  // Increment view count
  item.views = (item.views || 0) + 1;

  renderItemDetails(container, item);
});

function renderNotFound(container) {
  container.innerHTML = `
    <div class="text-center" style="padding: 64px 24px;">
      <div style="font-size: 4rem; margin-bottom: 16px;">📦</div>
      <h2>Item Not Found</h2>
      <p style="margin-bottom: 24px;">The listing you are looking for may have been removed or sold by the owner.</p>
      <a href="explore.html" class="btn btn-primary">Browse Marketplace</a>
    </div>
  `;
}

function renderItemDetails(container, item) {
  const isOwner = getCurrentUser() && getCurrentUser().id === item.sellerId;
  const wishlisted = isWishlisted(item.id);
  const formattedPrice = item.price === 0 ? "Free" : `$${item.price.toFixed(2)}`;

  container.innerHTML = `
    <!-- Breadcrumb -->
    <div style="display: flex; gap: 8px; font-size: 0.875rem; color: var(--secondary-text); margin-bottom: 24px;">
      <a href="index.html">Home</a> &rsaquo; 
      <a href="explore.html">Marketplace</a> &rsaquo; 
      <a href="explore.html?category=${item.category}">${item.category}</a> &rsaquo; 
      <span style="color: var(--navy); font-weight: 500;">${item.title}</span>
    </div>

    <div class="grid-2" style="grid-template-columns: 1.2fr 0.8fr; align-items: start; gap: 32px;">
      
      <!-- Gallery Column -->
      <div>
        <div style="background: var(--white); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 16px; box-shadow: var(--shadow-sm);">
          <img id="main-gallery-img" src="${item.image}" alt="${item.title}" style="width: 100%; max-height: 480px; object-fit: contain; background: #FAFBFD;" />
        </div>

        ${item.images && item.images.length > 1 ? `
          <div style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px;">
            ${item.images.map((img, idx) => `
              <img src="${img}" alt="Thumbnail ${idx + 1}" 
                   onclick="document.getElementById('main-gallery-img').src='${img}'"
                   style="width: 80px; height: 80px; object-fit: cover; border-radius: var(--radius-sm); border: 2px solid var(--border); cursor: pointer; transition: var(--transition-fast);" 
                   onmouseover="this.style.borderColor='var(--blue)'" 
                   onmouseout="this.style.borderColor='var(--border)'" />
            `).join('')}
          </div>
        ` : ''}

        <!-- Description Box -->
        <div class="card mt-xl">
          <div class="card-header">
            <h3>Item Description</h3>
          </div>
          <div class="card-body">
            <p style="font-size: 1rem; color: var(--text); line-height: 1.7; white-space: pre-line;">${item.description}</p>
          </div>
        </div>

        <!-- Campus Safety Tips Box -->
        <div class="card mt-lg" style="background-color: var(--blue-light); border-color: rgba(23, 105, 255, 0.2);">
          <div class="card-body" style="display: flex; gap: 16px; align-items: flex-start;">
            <div style="font-size: 1.8rem; line-height: 1;">🛡️</div>
            <div>
              <h4 style="color: var(--navy); margin-bottom: 4px;">Campus Safety Guidelines</h4>
              <p style="font-size: 0.875rem; color: var(--navy); opacity: 0.85;">
                Always arrange pickups in well-lit public campus areas such as the Student Union, Library lobby, or Campus Police Safe Exchange Zones. Inspect the item thoroughly before finalizing any payment.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action & Seller Details Column -->
      <div style="position: sticky; top: 90px;">
        
        <div class="card" style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <span class="badge badge-purple" style="font-size: 0.8rem; text-transform: uppercase;">${item.category}</span>
            <span class="badge badge-success">${item.condition}</span>
          </div>

          <h1 style="font-size: 1.75rem; margin-bottom: 12px; color: var(--navy);">${item.title}</h1>
          
          <div style="display: flex; align-items: baseline; gap: 12px; margin-bottom: 20px;">
            <span style="font-size: 2.25rem; font-weight: 800; color: var(--navy);">${formattedPrice}</span>
            ${item.originalPrice && item.originalPrice > item.price ? `
              <span style="font-size: 1.1rem; color: var(--secondary-text); text-decoration: line-through;">$${item.originalPrice.toFixed(2)}</span>
            ` : ''}
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.9rem; color: var(--secondary-text); padding-bottom: 20px; border-bottom: 1px solid var(--border); margin-bottom: 20px;">
            <div>📍 <strong>Pickup Location:</strong> ${item.location}</div>
            <div>🏫 <strong>Campus:</strong> ${item.sellerUniversity}</div>
            <div>🕒 <strong>Listed:</strong> ${item.postedDate}</div>
            <div>👁️ <strong>Views:</strong> ${item.views} student views</div>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${isOwner ? `
              <a href="my-listings.html" class="btn btn-secondary btn-block btn-lg">⚙️ Manage My Listing</a>
            ` : `
              <button class="btn btn-primary btn-block btn-lg" id="open-message-modal-btn">
                💬 Contact Seller
              </button>
            `}

            <div style="display: flex; gap: 12px;">
              <button class="btn btn-outline btn-block ${wishlisted ? 'btn-danger' : ''}" id="detail-wishlist-btn" onclick="toggleDetailWishlist('${item.id}')">
                ${wishlisted ? '❤️ Saved to Wishlist' : '🤍 Add to Wishlist'}
              </button>
              <button class="btn btn-outline" onclick="copyShareLink()" title="Share Link">
                🔗
              </button>
            </div>
          </div>
        </div>

        <!-- Seller Profile Card -->
        <div class="card mt-lg" style="padding: 20px;">
          <h4 style="margin-bottom: 16px; font-size: 1rem; color: var(--navy);">Seller Information</h4>
          <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 16px;">
            <img src="${item.sellerAvatar}" alt="${item.sellerName}" class="avatar avatar-lg" />
            <div>
              <div style="font-weight: 700; font-size: 1.1rem; color: var(--navy); display: flex; align-items: center; gap: 6px;">
                ${item.sellerName}
                <span style="font-size: 0.9rem;" title="Verified Student">✓</span>
              </div>
              <div style="font-size: 0.85rem; color: var(--secondary-text);">${item.sellerUniversity}</div>
              <div style="font-size: 0.85rem; color: #F59E0B; font-weight: 600; margin-top: 2px;">
                ★ 4.9 (18 reviews)
              </div>
            </div>
          </div>

          <div style="background-color: var(--background); padding: 12px; border-radius: var(--radius-sm); font-size: 0.825rem; color: var(--secondary-text); display: flex; justify-content: space-between;">
            <span>⚡ Typical Response: <strong>Within 1 hour</strong></span>
            <span>🎓 Verified Student</span>
          </div>
        </div>

      </div>

    </div>

    <!-- Contact Modal -->
    <div class="modal-backdrop" id="contact-seller-modal">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">Contact ${item.sellerName}</h3>
          <button class="modal-close" onclick="closeContactModal()">✕</button>
        </div>
        <div class="modal-body">
          <div style="display: flex; gap: 12px; padding: 12px; background: var(--background); border-radius: var(--radius-sm); margin-bottom: 16px;">
            <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />
            <div>
              <div style="font-weight: 600; font-size: 0.95rem;">${item.title}</div>
              <div style="color: var(--blue); font-weight: 700;">${formattedPrice}</div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Your Message</label>
            <textarea class="textarea-field" id="seller-message-input" placeholder="Hi ${item.sellerName}, I would like to buy this item. When are you available to meet on campus?"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeContactModal()">Cancel</button>
          <button class="btn btn-primary" id="send-seller-message-btn">Send Message</button>
        </div>
      </div>
    </div>
  `;

  // Bind Contact Modal Events
  const openModalBtn = document.getElementById("open-message-modal-btn");
  const modal = document.getElementById("contact-seller-modal");
  const sendBtn = document.getElementById("send-seller-message-btn");

  if (openModalBtn && modal) {
    openModalBtn.addEventListener("click", () => {
      modal.classList.add("show");
    });
  }

  window.closeContactModal = function() {
    if (modal) modal.classList.remove("show");
  };

  if (sendBtn) {
    sendBtn.addEventListener("click", function() {
      const text = document.getElementById("seller-message-input").value.trim();
      const convId = createConversation(item, text);
      showToast("Message sent to seller!", "success");
      closeContactModal();
      setTimeout(() => {
        window.location.href = `messages.html?conv=${convId}`;
      }, 600);
    });
  }
}

window.toggleDetailWishlist = function(itemId) {
  const added = toggleWishlist(itemId);
  updateHeaderWishlistCount();

  const btn = document.getElementById("detail-wishlist-btn");
  if (btn) {
    if (added) {
      btn.className = "btn btn-outline btn-block btn-danger";
      btn.innerHTML = "❤️ Saved to Wishlist";
      showToast("Added to your wishlist", "success");
    } else {
      btn.className = "btn btn-outline btn-block";
      btn.innerHTML = "🤍 Add to Wishlist";
      showToast("Removed from wishlist", "info");
    }
  }
};

window.copyShareLink = function() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    showToast("Listing link copied to clipboard!", "success");
  }).catch(() => {
    showToast("Listing link copied!", "success");
  });
};
