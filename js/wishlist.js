/* ==========================================================================
   CampusShare - Wishlist Controller
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function() {
  const container = document.getElementById("wishlist-grid");
  if (!container) return;

  renderWishlistPage();

  document.addEventListener("wishlistUpdated", function() {
    renderWishlistPage();
  });
});

function renderWishlistPage() {
  const container = document.getElementById("wishlist-grid");
  const countBadge = document.getElementById("wishlist-count");
  const clearBtn = document.getElementById("clear-wishlist-btn");

  if (!container) return;

  const wishlistIds = getWishlist();
  const allItems = getItems();
  const wishlistedItems = allItems.filter(item => wishlistIds.includes(item.id));

  if (countBadge) {
    countBadge.textContent = `${wishlistedItems.length} Saved Item${wishlistedItems.length === 1 ? '' : 's'}`;
  }

  if (clearBtn) {
    clearBtn.style.display = wishlistedItems.length > 0 ? "inline-flex" : "none";
    clearBtn.onclick = function() {
      if (confirm("Are you sure you want to clear your wishlist?")) {
        localStorage.setItem("campus_share_wishlist", JSON.stringify([]));
        updateHeaderWishlistCount();
        renderWishlistPage();
        showToast("Wishlist cleared", "info");
      }
    };
  }

  if (wishlistedItems.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 64px 24px; background: var(--white); border-radius: var(--radius-lg); border: 1px solid var(--border);">
        <div style="font-size: 3.5rem; margin-bottom: 16px;">❤️</div>
        <h3 style="color: var(--navy); margin-bottom: 8px;">Your Wishlist is Empty</h3>
        <p style="color: var(--secondary-text); max-width: 420px; margin: 0 auto 24px auto;">
          Save textbooks, tech gear, or dorm furniture while browsing so you can easily compare and message sellers later.
        </p>
        <a href="explore.html" class="btn btn-primary">Browse Campus Marketplace</a>
      </div>
    `;
  } else {
    container.innerHTML = wishlistedItems.map(item => renderProductCard(item)).join("");
  }
}
