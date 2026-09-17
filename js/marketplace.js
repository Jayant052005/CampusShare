/* ==========================================================================
   CampusShare - Marketplace & Explore Controller
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function() {
  if (document.getElementById("explore-grid")) {
    initExplorePage();
  }
  if (document.getElementById("index-featured-grid")) {
    initIndexPage();
  }
});

// Explore Page Logic
function initExplorePage() {
  const exploreGrid = document.getElementById("explore-grid");
  const resultsCount = document.getElementById("results-count");
  const searchInput = document.getElementById("explore-search");
  const categorySelect = document.getElementById("filter-category");
  const conditionSelect = document.getElementById("filter-condition");
  const sortSelect = document.getElementById("filter-sort");
  const maxPriceInput = document.getElementById("filter-price-max");
  const clearBtn = document.getElementById("clear-filters-btn");
  const viewGridBtn = document.getElementById("view-grid-btn");
  const viewListBtn = document.getElementById("view-list-btn");

  // Read URL query parameters (e.g. explore.html?q=textbook&category=textbooks)
  const urlParams = new URLSearchParams(window.location.search);
  const qParam = urlParams.get("q");
  const catParam = urlParams.get("category");

  if (qParam && searchInput) searchInput.value = qParam;
  if (catParam && categorySelect) categorySelect.value = catParam;

  function renderMarketplace() {
    let items = getItems();

    // Search query filter
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    if (query) {
      items = items.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      );
    }

    // Category filter
    const selectedCategory = categorySelect ? categorySelect.value : "";
    if (selectedCategory) {
      items = items.filter(item => item.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Condition filter
    const selectedCondition = conditionSelect ? conditionSelect.value : "";
    if (selectedCondition) {
      items = items.filter(item => item.condition.toLowerCase() === selectedCondition.toLowerCase());
    }

    // Max Price filter
    const maxPrice = maxPriceInput ? parseFloat(maxPriceInput.value) : NaN;
    if (!isNaN(maxPrice) && maxPrice >= 0) {
      items = items.filter(item => item.price <= maxPrice);
    }

    // Sorting
    const sortBy = sortSelect ? sortSelect.value : "newest";
    if (sortBy === "price-low") {
      items.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      items.sort((a, b) => b.price - a.price);
    } else if (sortBy === "popular") {
      items.sort((a, b) => b.views - a.views);
    } else {
      // Default: newest first
      items.sort((a, b) => b.id.localeCompare(a.id));
    }

    // Update results count
    if (resultsCount) {
      resultsCount.textContent = `Showing ${items.length} item${items.length === 1 ? '' : 's'}`;
    }

    // Render items
    if (items.length === 0) {
      const postUrl = getAppUrl("post-item.html");
      exploreGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; background: var(--white); border-radius: var(--radius-md); border: 1px solid var(--border);">
          <div style="font-size: 3rem; margin-bottom: 12px;">🔍</div>
          <h3 style="color: var(--navy); margin-bottom: 8px;">No campus items match your criteria</h3>
          <p style="color: var(--secondary-text); max-width: 400px; margin: 0 auto 20px auto;">Be the first student to post an item on CampusShare!</p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button class="btn btn-outline" onclick="resetExploreFilters()">Reset Filters</button>
            <a href="${postUrl}" class="btn btn-primary">+ Post Item</a>
          </div>
        </div>
      `;
    } else {
      exploreGrid.innerHTML = items.map(item => renderProductCard(item)).join("");
    }
  }

  // Event Listeners for Filters
  if (searchInput) searchInput.addEventListener("input", renderMarketplace);
  if (categorySelect) categorySelect.addEventListener("change", renderMarketplace);
  if (conditionSelect) conditionSelect.addEventListener("change", renderMarketplace);
  if (sortSelect) sortSelect.addEventListener("change", renderMarketplace);
  if (maxPriceInput) maxPriceInput.addEventListener("input", renderMarketplace);

  if (clearBtn) {
    clearBtn.addEventListener("click", function() {
      resetExploreFilters();
    });
  }

  window.resetExploreFilters = function() {
    if (searchInput) searchInput.value = "";
    if (categorySelect) categorySelect.value = "";
    if (conditionSelect) conditionSelect.value = "";
    if (sortSelect) sortSelect.value = "newest";
    if (maxPriceInput) maxPriceInput.value = "";
    window.history.replaceState({}, document.title, window.location.pathname);
    renderMarketplace();
  };

  // Grid / List View Toggle
  if (viewGridBtn && viewListBtn) {
    viewGridBtn.addEventListener("click", () => {
      exploreGrid.className = "grid-3";
      viewGridBtn.classList.add("btn-primary");
      viewGridBtn.classList.remove("btn-outline");
      viewListBtn.classList.add("btn-outline");
      viewListBtn.classList.remove("btn-primary");
    });
    viewListBtn.addEventListener("click", () => {
      exploreGrid.className = "grid-1";
      viewListBtn.classList.add("btn-primary");
      viewListBtn.classList.remove("btn-outline");
      viewGridBtn.classList.add("btn-outline");
      viewGridBtn.classList.remove("btn-primary");
    });
  }

  // Initial Render
  renderMarketplace();
}

// Index Landing Page Featured Section
function initIndexPage() {
  const featuredGrid = document.getElementById("index-featured-grid");
  const recentGrid = document.getElementById("index-recent-grid");

  const items = getItems();
  const postUrl = getAppUrl("post-item.html");

  if (featuredGrid) {
    const featuredItems = items.filter(i => i.featured).slice(0, 4);
    if (featuredItems.length === 0) {
      featuredGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: var(--background); border-radius: var(--radius-md); border: 1px solid var(--border);">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">📦</div>
          <h3 style="color: var(--navy); margin-bottom: 4px;">No featured items yet</h3>
          <p style="color: var(--secondary-text); margin-bottom: 16px;">Be the first student to list an item on your campus!</p>
          <a href="${postUrl}" class="btn btn-primary">+ Post an Item</a>
        </div>
      `;
    } else {
      featuredGrid.innerHTML = featuredItems.map(item => renderProductCard(item)).join("");
    }
  }

  if (recentGrid) {
    const recentItems = items.slice(0, 6);
    if (recentItems.length === 0) {
      recentGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: var(--background); border-radius: var(--radius-md); border: 1px solid var(--border);">
          <div style="font-size: 2.5rem; margin-bottom: 8px;">✨</div>
          <h3 style="color: var(--navy); margin-bottom: 4px;">No campus listings yet</h3>
          <p style="color: var(--secondary-text); margin-bottom: 16px;">Create a new listing to start trading textbooks, tech, and dorm items.</p>
          <a href="${postUrl}" class="btn btn-primary btn-sm">+ Post a New Listing</a>
        </div>
      `;
    } else {
      recentGrid.innerHTML = recentItems.map(item => renderProductCard(item)).join("");
    }
  }
}
