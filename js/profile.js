/* ==========================================================================
   CampusShare - User Profile & Listing Management Controller
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function() {
  if (document.getElementById("profile-header")) {
    initProfilePage();
  }
  if (document.getElementById("my-listings-grid")) {
    initMyListingsPage();
  }
  if (document.getElementById("settings-form")) {
    initSettingsPage();
  }
});

// Profile Page Render
function initProfilePage() {
  const user = getCurrentUser();
  const headerContainer = document.getElementById("profile-header");
  const listingsContainer = document.getElementById("profile-listings-grid");

  if (!user) {
    const loginUrl = getAppUrl("login.html");
    const regUrl = getAppUrl("register.html");

    if (headerContainer) {
      headerContainer.innerHTML = `
        <div style="text-align: center; padding: 24px;">
          <div style="font-size: 3rem; margin-bottom: 12px;">👤</div>
          <h2 style="color: var(--navy); margin-bottom: 8px;">Not Signed In</h2>
          <p style="color: var(--secondary-text); max-width: 420px; margin: 0 auto 20px auto;">
            Log in or register with your student email (.edu) to access your campus profile and manage listings.
          </p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <a href="${loginUrl}" class="btn btn-outline">Log In</a>
            <a href="${regUrl}" class="btn btn-primary">Register Account</a>
          </div>
        </div>
      `;
    }
    if (listingsContainer) {
      listingsContainer.innerHTML = "";
    }
    return;
  }

  if (headerContainer) {
    const settingsUrl = getAppUrl("settings.html");
    headerContainer.innerHTML = `
      <div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
        <img src="${user.avatar}" alt="${user.name}" class="avatar avatar-xl" style="border: 4px solid var(--white);" />
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
            <h1 style="color: var(--navy); font-size: 2rem;">${user.name}</h1>
            <span class="badge badge-success" style="font-size: 0.8rem;">✓ Verified Student</span>
          </div>
          <p style="color: var(--secondary-text); font-size: 1.05rem; margin-bottom: 8px;">
            🎓 <strong>${user.major}</strong> &bull; 🏫 ${user.university}
          </p>
          <div style="display: flex; gap: 20px; font-size: 0.9rem; color: var(--navy);">
            <span>⭐ <strong>${user.rating}</strong> (${user.reviewsCount} reviews)</span>
            <span>📅 Joined ${user.joinedDate}</span>
            <span>✉️ ${user.email}</span>
          </div>
        </div>
        <div>
          <a href="${settingsUrl}" class="btn btn-outline">⚙️ Edit Profile</a>
        </div>
      </div>
    `;
  }

  if (listingsContainer) {
    const items = getItems();
    const userItems = items.filter(item => item.sellerId === user.id || item.sellerName === user.name);

    if (userItems.length === 0) {
      const postUrl = getAppUrl("post-item.html");
      listingsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: var(--white); border-radius: var(--radius-md); border: 1px solid var(--border);">
          <div style="font-size: 3rem; margin-bottom: 12px;">📦</div>
          <h3>No active listings</h3>
          <p style="margin-bottom: 20px;">You haven't posted any items yet.</p>
          <a href="${postUrl}" class="btn btn-primary">+ Post Your First Item</a>
        </div>
      `;
    } else {
      listingsContainer.innerHTML = userItems.map(item => renderProductCard(item)).join("");
    }
  }
}

// My Listings Page Render (Seller Dashboard)
function initMyListingsPage() {
  const container = document.getElementById("my-listings-grid");
  const user = getCurrentUser();
  if (!container) return;

  if (!user) {
    const loginUrl = getAppUrl("login.html");
    const regUrl = getAppUrl("register.html");
    container.innerHTML = `
      <div style="text-align: center; padding: 64px 24px; background: var(--white); border-radius: var(--radius-lg); border: 1px solid var(--border);">
        <div style="font-size: 3.5rem; margin-bottom: 16px;">🔐</div>
        <h3 style="color: var(--navy); margin-bottom: 8px;">Authentication Required</h3>
        <p style="color: var(--secondary-text); max-width: 400px; margin: 0 auto 24px auto;">
          Please sign in to view and manage your campus marketplace listings.
        </p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <a href="${loginUrl}" class="btn btn-outline">Log In</a>
          <a href="${regUrl}" class="btn btn-primary">Register Account</a>
        </div>
      </div>
    `;
    return;
  }

  function renderListings() {
    const items = getItems();
    const userItems = items.filter(item => item.sellerId === user.id || item.sellerName === user.name);

    if (userItems.length === 0) {
      const postUrl = getAppUrl("post-item.html");
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 64px 24px; background: var(--white); border-radius: var(--radius-lg); border: 1px solid var(--border);">
          <div style="font-size: 3.5rem; margin-bottom: 16px;">🏷️</div>
          <h3 style="color: var(--navy); margin-bottom: 8px;">No Listings Found</h3>
          <p style="color: var(--secondary-text); max-width: 400px; margin: 0 auto 24px auto;">
            Clean out your dorm room or sell your past semester's textbooks to fellow campus students.
          </p>
          <a href="${postUrl}" class="btn btn-primary btn-lg">+ Post an Item Now</a>
        </div>
      `;
      return;
    }

    const itemDetailsUrl = getAppUrl("item-details.html");

    container.innerHTML = userItems.map(item => `
      <div class="card" style="display: flex; gap: 20px; padding: 16px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
        <div style="display: flex; gap: 16px; align-items: center; min-width: 280px; flex: 1;">
          <img src="${item.image}" alt="${item.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: var(--radius-md);" />
          <div>
            <span class="badge ${item.status === 'sold' ? 'badge-neutral' : 'badge-success'}" style="margin-bottom: 4px;">
              ${item.status === 'sold' ? 'SOLD' : 'ACTIVE'}
            </span>
            <h4 style="margin: 0; font-size: 1.05rem; color: var(--navy);">${item.title}</h4>
            <div style="color: var(--blue); font-weight: 700; font-size: 1.1rem; margin-top: 4px;">$${item.price.toFixed(2)}</div>
            <div style="font-size: 0.8rem; color: var(--secondary-text); margin-top: 2px;">Listed ${item.postedDate} &bull; ${item.views} views</div>
          </div>
        </div>

        <div style="display: flex; gap: 8px; align-items: center;">
          ${item.status !== 'sold' ? `
            <button class="btn btn-outline btn-sm" onclick="markAsSold('${item.id}')">Mark as Sold</button>
          ` : `
            <button class="btn btn-outline btn-sm" onclick="reactivateItem('${item.id}')">Re-list Item</button>
          `}
          <a href="${itemDetailsUrl}?id=${item.id}" class="btn btn-ghost btn-sm">View</a>
          <button class="btn btn-danger btn-sm" onclick="confirmDeleteItem('${item.id}')">Delete</button>
        </div>
      </div>
    `).join("");
  }

  window.markAsSold = function(itemId) {
    updateItemStatus(itemId, "sold");
    showToast("Item marked as SOLD!", "success");
    renderListings();
  };

  window.reactivateItem = function(itemId) {
    updateItemStatus(itemId, "active");
    showToast("Item re-listed as active!", "info");
    renderListings();
  };

  window.confirmDeleteItem = function(itemId) {
    if (confirm("Are you sure you want to delete this listing?")) {
      deleteItem(itemId);
      showToast("Listing deleted", "info");
      renderListings();
    }
  };

  renderListings();
}

// Settings Page
function initSettingsPage() {
  const user = getCurrentUser();
  if (!user) {
    const loginUrl = getAppUrl("login.html");
    window.location.href = loginUrl;
    return;
  }

  const nameInput = document.getElementById("settings-name");
  const uniInput = document.getElementById("settings-university");
  const majorInput = document.getElementById("settings-major");
  const emailInput = document.getElementById("settings-email");
  const form = document.getElementById("settings-form");

  if (nameInput) nameInput.value = user.name || "";
  if (uniInput) uniInput.value = user.university || "";
  if (majorInput) majorInput.value = user.major || "";
  if (emailInput) emailInput.value = user.email || "";

  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      
      const updatedUser = {
        ...user,
        name: nameInput.value.trim(),
        university: uniInput.value,
        major: majorInput.value.trim(),
        email: emailInput.value.trim()
      };

      setCurrentUser(updatedUser);
      showToast("Profile settings saved!", "success");
      const profileUrl = getAppUrl("profile.html");
      setTimeout(() => {
        window.location.href = profileUrl;
      }, 600);
    });
  }
}
