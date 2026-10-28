/* ==========================================================================
   CampusShare - Marketplace Controller
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function() {
  if (document.getElementById("mp-listings-grid")) {
    initExploreMarketplace();
  }
});

function initExploreMarketplace() {
  // DOM Elements
  const grid = document.getElementById("mp-listings-grid");
  const countDisplay = document.getElementById("mp-results-count");
  const searchInput = document.getElementById("mp-search-input");
  const searchClearBtn = document.getElementById("mp-search-clear");
  const typeTabsContainer = document.getElementById("mp-type-tabs");
  const catListContainer = document.getElementById("mp-category-list");
  const conditionPillsContainer = document.getElementById("mp-condition-pills");
  const priceSlider = document.getElementById("mp-price-slider");
  const priceValDisplay = document.getElementById("mp-price-val");
  const collegeSelect = document.getElementById("mp-college-select");
  const sortSelect = document.getElementById("mp-sort");
  const resetBtn = document.getElementById("mp-reset-filters-btn");
  const chipsContainer = document.getElementById("mp-active-chips");

  // Mobile Filter Drawer Elements
  const mobileToggleBtn = document.getElementById("mp-mobile-toggle-btn");
  const mobileCloseBtn = document.getElementById("mp-mobile-close-btn");
  const mobileApplyBtn = document.getElementById("mp-mobile-apply-btn");
  const mobileActiveCount = document.getElementById("mp-mobile-active-count");
  const sidebar = document.getElementById("mp-sidebar");

  // Filter State
  const state = {
    search: "",
    type: "all",
    category: "all",
    condition: "all",
    maxPrice: 250,
    college: "all",
    sort: "newest"
  };

  // 1. Parse initial URL Query Parameters
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("q")) {
    state.search = urlParams.get("q").trim();
    if (searchInput) searchInput.value = state.search;
    if (searchClearBtn && state.search) searchClearBtn.style.display = "block";
  }

  if (urlParams.has("type")) {
    const paramType = urlParams.get("type").toLowerCase();
    if (["sell", "donate", "lend", "exchange"].includes(paramType)) {
      state.type = paramType;
      // Activate tab button
      const activeTab = typeTabsContainer.querySelector(`.mp-filter-tab[data-type="${paramType}"]`);
      if (activeTab) {
        typeTabsContainer.querySelectorAll(".mp-filter-tab").forEach(t => t.classList.remove("active"));
        activeTab.classList.add("active");
      }
    }
  }

  if (urlParams.has("category")) {
    state.category = urlParams.get("category");
    const activeCat = catListContainer.querySelector(`.mp-cat-item[data-category="${state.category}"]`);
    if (activeCat) {
      catListContainer.querySelectorAll(".mp-cat-item").forEach(c => c.classList.remove("active"));
      activeCat.classList.add("active");
    }
  }

  if (urlParams.has("college")) {
    state.college = urlParams.get("college");
    if (collegeSelect) collegeSelect.value = state.college;
  }

  // 2. Main Filter & Render Engine
  function renderMarketplace() {
    let items = getItems();

    // Search Filter
    if (state.search) {
      const q = state.search.toLowerCase();
      items = items.filter(item => {
        return (
          (item.title && item.title.toLowerCase().includes(q)) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.category && item.category.toLowerCase().includes(q)) ||
          (item.sellerName && item.sellerName.toLowerCase().includes(q)) ||
          (item.sellerUniversity && item.sellerUniversity.toLowerCase().includes(q)) ||
          (item.location && item.location.toLowerCase().includes(q))
        );
      });
    }

    // Listing Type Filter (sell, donate, lend, exchange)
    if (state.type !== "all") {
      items = items.filter(item => (item.type || "").toLowerCase() === state.type.toLowerCase());
    }

    // Category Filter
    if (state.category !== "all") {
      items = items.filter(item => (item.category || "").toLowerCase() === state.category.toLowerCase());
    }

    // Condition Filter
    if (state.condition !== "all") {
      items = items.filter(item => (item.condition || "").toLowerCase() === state.condition.toLowerCase());
    }

    // Max Price Filter
    if (state.maxPrice < 250) {
      items = items.filter(item => {
        const itemPrice = parseFloat(item.price) || 0;
        return itemPrice <= state.maxPrice;
      });
    }

    // College Filter
    if (state.college !== "all") {
      items = items.filter(item => {
        return (item.sellerUniversity || "").toLowerCase() === state.college.toLowerCase();
      });
    }

    // Sorting Engine
    if (state.sort === "price-low") {
      items.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
    } else if (state.sort === "price-high") {
      items.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
    } else if (state.sort === "popular") {
      items.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
      // Default: newest first (higher ID / unshift)
      items.sort((a, b) => {
        if (typeof a.id === "string" && a.id.startsWith("item_") && typeof b.id === "string" && b.id.startsWith("item_")) {
          return b.id.localeCompare(a.id);
        }
        return parseInt(b.id || 0) - parseInt(a.id || 0);
      });
    }

    // Update Result Counter
    if (countDisplay) {
      countDisplay.textContent = `Showing ${items.length} verified listing${items.length === 1 ? '' : 's'}`;
    }

    // Update Active Filter Chips & Mobile Counter
    updateActiveFilterChips();
    updateCategoryCounts();

    // Render Grid
    if (items.length === 0) {
      grid.innerHTML = `
        <div class="mp-empty-state">
          <div class="mp-empty-icon">🔍</div>
          <h3 class="mp-empty-title">No matching campus listings found</h3>
          <p class="mp-empty-desc">
            Try adjusting your search keywords, expanding the max price range, or clearing specific filters to see more student items.
          </p>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button type="button" class="btn btn-outline" onclick="window.resetMarketplaceFilters()">Reset Filters</button>
            <a href="${getAppUrl('post-item.html')}" class="btn btn-primary">+ Post an Item</a>
          </div>
        </div>
      `;
    } else {
      grid.innerHTML = items.map(item => renderListingCard(item)).join("");
    }
  }

  // 3. Dynamic Category Counts Calculator
  function updateCategoryCounts() {
    const allItems = getItems();
    const countCatAll = document.getElementById("count-cat-all");
    if (countCatAll) countCatAll.textContent = allItems.length;

    const catMapping = {
      "count-cat-books": "Books",
      "count-cat-notes": "Notes",
      "count-cat-electronics": "Electronics",
      "count-cat-stationery": "Stationery",
      "count-cat-lab": "Lab Equipment",
      "count-cat-project": "Project Materials",
      "count-cat-hostel": "Hostel Items",
      "count-cat-bags": "Bags",
      "count-cat-sports": "Sports",
      "count-cat-other": "Other"
    };

    Object.keys(catMapping).forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const catName = catMapping[id];
        const count = allItems.filter(item => (item.category || "").toLowerCase() === catName.toLowerCase()).length;
        el.textContent = count;
      }
    });
  }

  // 4. Active Chips Bar
  function updateActiveFilterChips() {
    if (!chipsContainer) return;
    let chipsHtml = "";
    let activeFilterCount = 0;

    if (state.search) {
      activeFilterCount++;
      chipsHtml += `
        <span class="mp-chip">
          Search: "${state.search}"
          <span class="mp-chip-remove" onclick="window.clearSearchFilter()">✕</span>
        </span>
      `;
    }

    if (state.type !== "all") {
      activeFilterCount++;
      chipsHtml += `
        <span class="mp-chip">
          Type: ${state.type.toUpperCase()}
          <span class="mp-chip-remove" onclick="window.setTypeFilter('all')">✕</span>
        </span>
      `;
    }

    if (state.category !== "all") {
      activeFilterCount++;
      chipsHtml += `
        <span class="mp-chip">
          ${state.category}
          <span class="mp-chip-remove" onclick="window.setCategoryFilter('all')">✕</span>
        </span>
      `;
    }

    if (state.condition !== "all") {
      activeFilterCount++;
      chipsHtml += `
        <span class="mp-chip">
          ${state.condition}
          <span class="mp-chip-remove" onclick="window.setConditionFilter('all')">✕</span>
        </span>
      `;
    }

    if (state.maxPrice < 250) {
      activeFilterCount++;
      chipsHtml += `
        <span class="mp-chip">
          Under $${state.maxPrice}
          <span class="mp-chip-remove" onclick="window.resetPriceFilter()">✕</span>
        </span>
      `;
    }

    if (state.college !== "all") {
      activeFilterCount++;
      chipsHtml += `
        <span class="mp-chip">
          ${state.college}
          <span class="mp-chip-remove" onclick="window.setCollegeFilter('all')">✕</span>
        </span>
      `;
    }

    chipsContainer.innerHTML = chipsHtml;

    if (mobileActiveCount) {
      if (activeFilterCount > 0) {
        mobileActiveCount.style.display = "inline-flex";
        mobileActiveCount.textContent = activeFilterCount;
      } else {
        mobileActiveCount.style.display = "none";
      }
    }
  }

  // 5. Global Reset & Filter Setter Handlers
  window.resetMarketplaceFilters = function() {
    state.search = "";
    state.type = "all";
    state.category = "all";
    state.condition = "all";
    state.maxPrice = 250;
    state.college = "all";
    state.sort = "newest";

    if (searchInput) searchInput.value = "";
    if (searchClearBtn) searchClearBtn.style.display = "none";

    if (typeTabsContainer) {
      typeTabsContainer.querySelectorAll(".mp-filter-tab").forEach(t => t.classList.remove("active"));
      const allTab = typeTabsContainer.querySelector('.mp-filter-tab[data-type="all"]');
      if (allTab) allTab.classList.add("active");
    }

    if (catListContainer) {
      catListContainer.querySelectorAll(".mp-cat-item").forEach(c => c.classList.remove("active"));
      const allCat = catListContainer.querySelector('.mp-cat-item[data-category="all"]');
      if (allCat) allCat.classList.add("active");
    }

    if (conditionPillsContainer) {
      conditionPillsContainer.querySelectorAll(".mp-condition-pill").forEach(p => p.classList.remove("active"));
      const allPill = conditionPillsContainer.querySelector('.mp-condition-pill[data-condition="all"]');
      if (allPill) allPill.classList.add("active");
    }

    if (priceSlider) priceSlider.value = 250;
    if (priceValDisplay) priceValDisplay.textContent = "$250+";

    if (collegeSelect) collegeSelect.value = "all";
    if (sortSelect) sortSelect.value = "newest";

    // Clean up query string
    window.history.replaceState({}, document.title, window.location.pathname);
    renderMarketplace();
  };

  window.clearSearchFilter = function() {
    state.search = "";
    if (searchInput) searchInput.value = "";
    if (searchClearBtn) searchClearBtn.style.display = "none";
    renderMarketplace();
  };

  window.setTypeFilter = function(type) {
    state.type = type;
    if (typeTabsContainer) {
      typeTabsContainer.querySelectorAll(".mp-filter-tab").forEach(t => t.classList.remove("active"));
      const target = typeTabsContainer.querySelector(`.mp-filter-tab[data-type="${type}"]`);
      if (target) target.classList.add("active");
    }
    renderMarketplace();
  };

  window.setCategoryFilter = function(cat) {
    state.category = cat;
    if (catListContainer) {
      catListContainer.querySelectorAll(".mp-cat-item").forEach(c => c.classList.remove("active"));
      const target = catListContainer.querySelector(`.mp-cat-item[data-category="${cat}"]`);
      if (target) target.classList.add("active");
    }
    renderMarketplace();
  };

  window.setConditionFilter = function(cond) {
    state.condition = cond;
    if (conditionPillsContainer) {
      conditionPillsContainer.querySelectorAll(".mp-condition-pill").forEach(p => p.classList.remove("active"));
      const target = conditionPillsContainer.querySelector(`.mp-condition-pill[data-condition="${cond}"]`);
      if (target) target.classList.add("active");
    }
    renderMarketplace();
  };

  window.resetPriceFilter = function() {
    state.maxPrice = 250;
    if (priceSlider) priceSlider.value = 250;
    if (priceValDisplay) priceValDisplay.textContent = "$250+";
    renderMarketplace();
  };

  window.setCollegeFilter = function(coll) {
    state.college = coll;
    if (collegeSelect) collegeSelect.value = coll;
    renderMarketplace();
  };

  // 6. Bind Event Listeners
  if (searchInput) {
    searchInput.addEventListener("input", function() {
      state.search = this.value.trim();
      if (searchClearBtn) {
        searchClearBtn.style.display = state.search ? "block" : "none";
      }
      renderMarketplace();
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener("click", window.clearSearchFilter);
  }

  // Type Tabs
  if (typeTabsContainer) {
    typeTabsContainer.addEventListener("click", function(e) {
      const tab = e.target.closest(".mp-filter-tab");
      if (!tab) return;
      typeTabsContainer.querySelectorAll(".mp-filter-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      state.type = tab.getAttribute("data-type") || "all";
      renderMarketplace();
    });
  }

  // Category List
  if (catListContainer) {
    catListContainer.addEventListener("click", function(e) {
      const item = e.target.closest(".mp-cat-item");
      if (!item) return;
      catListContainer.querySelectorAll(".mp-cat-item").forEach(c => c.classList.remove("active"));
      item.classList.add("active");
      state.category = item.getAttribute("data-category") || "all";
      renderMarketplace();
    });
  }

  // Condition Pills
  if (conditionPillsContainer) {
    conditionPillsContainer.addEventListener("click", function(e) {
      const pill = e.target.closest(".mp-condition-pill");
      if (!pill) return;
      conditionPillsContainer.querySelectorAll(".mp-condition-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      state.condition = pill.getAttribute("data-condition") || "all";
      renderMarketplace();
    });
  }

  // Price Slider
  if (priceSlider) {
    priceSlider.addEventListener("input", function() {
      state.maxPrice = parseFloat(this.value);
      if (priceValDisplay) {
        priceValDisplay.textContent = state.maxPrice >= 250 ? "$250+" : `$${state.maxPrice}`;
      }
      renderMarketplace();
    });
  }

  // College Dropdown
  if (collegeSelect) {
    collegeSelect.addEventListener("change", function() {
      state.college = this.value;
      renderMarketplace();
    });
  }

  // Sort Dropdown
  if (sortSelect) {
    sortSelect.addEventListener("change", function() {
      state.sort = this.value;
      renderMarketplace();
    });
  }

  // Reset Filters Button
  if (resetBtn) {
    resetBtn.addEventListener("click", window.resetMarketplaceFilters);
  }

  // Mobile Filter Drawer Toggle
  if (mobileToggleBtn && sidebar) {
    mobileToggleBtn.addEventListener("click", function() {
      sidebar.classList.add("show-mobile");
      if (mobileCloseBtn) mobileCloseBtn.style.display = "inline-block";
      if (mobileApplyBtn) mobileApplyBtn.style.display = "block";
    });
  }

  if (mobileCloseBtn && sidebar) {
    mobileCloseBtn.addEventListener("click", function() {
      sidebar.classList.remove("show-mobile");
    });
  }

  if (mobileApplyBtn && sidebar) {
    mobileApplyBtn.addEventListener("click", function() {
      sidebar.classList.remove("show-mobile");
    });
  }

  // Wishlist Sync Listener (if an item is wishlisted from this page or elsewhere)
  document.addEventListener("wishlistUpdated", function() {
    // Re-sync favorite buttons
    const wishlist = getWishlist();
    document.querySelectorAll(".hp-listing-fav-btn").forEach(btn => {
      const id = btn.getAttribute("data-id");
      const isSaved = wishlist.includes(String(id));
      if (isSaved) {
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
  });

  // Initial Render
  renderMarketplace();
}
