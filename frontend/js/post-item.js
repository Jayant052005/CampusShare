/* ==========================================================================
   CampusShare - 5-Step Post Item Workflow Controller
   ========================================================================== */

let currentStep = 1;

const formData = {
  title: "",
  category: "",
  condition: "",
  description: "",
  type: "sell",
  price: 0,
  originalPrice: 0,
  negotiable: false,
  donateConfirmed: true,
  lendDuration: "1 Semester",
  deposit: 0,
  exchangeFor: "",
  location: "",
  photos: []
};

document.addEventListener("DOMContentLoaded", function() {
  initStep1Validation();
  initStep2TypeSelection();
  initStep4PhotoUpload();
  updateStepperUI();
});

// ─── STEP NAVIGATION ────────────────────────────────────────────────────────
function goToStep(stepNumber) {
  if (stepNumber < 1 || stepNumber > 5) return;

  // Validate prior to moving forward
  if (stepNumber > currentStep) {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 3 && !validateStep3()) return;
  }

  // Hide all panels
  for (let i = 1; i <= 5; i++) {
    const panel = document.getElementById(`pi-panel-${i}`);
    if (panel) panel.style.display = "none";
  }

  // Show target panel
  const targetPanel = document.getElementById(`pi-panel-${stepNumber}`);
  if (targetPanel) targetPanel.style.display = "block";

  currentStep = stepNumber;
  updateStepperUI();

  // If entering review step, hydrate review panel
  if (currentStep === 5) {
    hydrateStep5Review();
  }

  // Smooth scroll up to form top
  window.scrollTo({ top: 120, behavior: "smooth" });
}

window.goToStep = goToStep;

window.jumpToStep = function(stepNumber) {
  // Allow jumping to steps that are already completed or current
  if (stepNumber < currentStep) {
    goToStep(stepNumber);
  } else if (stepNumber === currentStep + 1) {
    goToStep(stepNumber);
  }
};

function updateStepperUI() {
  const badge = document.getElementById("pi-step-badge");
  if (badge) badge.textContent = `STEP ${currentStep} OF 5`;

  document.querySelectorAll(".pi-step-item").forEach(item => {
    const s = parseInt(item.getAttribute("data-step"));
    const bubble = item.querySelector(".pi-step-bubble");

    item.classList.remove("active", "completed");

    if (s === currentStep) {
      item.classList.add("active");
      if (bubble) bubble.textContent = s;
    } else if (s < currentStep) {
      item.classList.add("completed");
      if (bubble) bubble.textContent = "✓";
    } else {
      if (bubble) bubble.textContent = s;
    }
  });
}

// ─── STEP 1: BASIC INFORMATION ──────────────────────────────────────────────
function initStep1Validation() {
  const titleInput = document.getElementById("pi-title");
  const catSelect = document.getElementById("pi-category");
  const condSelect = document.getElementById("pi-condition");
  const descInput = document.getElementById("pi-description");
  const nextBtn = document.getElementById("pi-btn-step1-next");

  function checkFormValidity() {
    const titleVal = titleInput ? titleInput.value.trim() : "";
    const catVal = catSelect ? catSelect.value : "";
    const condVal = condSelect ? condSelect.value : "";
    const descVal = descInput ? descInput.value.trim() : "";

    const isValid = titleVal.length >= 3 && catVal !== "" && condVal !== "" && descVal.length >= 10;

    if (nextBtn) {
      nextBtn.disabled = !isValid;
    }

    return isValid;
  }

  [titleInput, catSelect, condSelect, descInput].forEach(el => {
    if (el) {
      el.addEventListener("input", checkFormValidity);
      el.addEventListener("change", checkFormValidity);
    }
  });

  if (nextBtn) {
    nextBtn.addEventListener("click", function() {
      if (validateStep1()) {
        goToStep(2);
      }
    });
  }
}

function validateStep1() {
  const titleInput = document.getElementById("pi-title");
  const catSelect = document.getElementById("pi-category");
  const condSelect = document.getElementById("pi-condition");
  const descInput = document.getElementById("pi-description");

  let valid = true;

  if (!titleInput.value.trim() || titleInput.value.trim().length < 3) {
    document.getElementById("err-pi-title").style.display = "block";
    valid = false;
  } else {
    document.getElementById("err-pi-title").style.display = "none";
  }

  if (!catSelect.value) {
    document.getElementById("err-pi-category").style.display = "block";
    valid = false;
  } else {
    document.getElementById("err-pi-category").style.display = "none";
  }

  if (!condSelect.value) {
    document.getElementById("err-pi-condition").style.display = "block";
    valid = false;
  } else {
    document.getElementById("err-pi-condition").style.display = "none";
  }

  if (!descInput.value.trim() || descInput.value.trim().length < 10) {
    document.getElementById("err-pi-description").style.display = "block";
    valid = false;
  } else {
    document.getElementById("err-pi-description").style.display = "none";
  }

  if (valid) {
    formData.title = titleInput.value.trim();
    formData.category = catSelect.value;
    formData.condition = condSelect.value;
    formData.description = descInput.value.trim();
  }

  return valid;
}

// ─── STEP 2: LISTING TYPE SELECTION ─────────────────────────────────────────
function initStep2TypeSelection() {
  const cards = document.querySelectorAll(".pi-type-card");
  cards.forEach(card => {
    card.addEventListener("click", function() {
      cards.forEach(c => {
        c.classList.remove("selected");
        const chk = c.querySelector(".pi-type-check");
        if (chk) chk.textContent = "";
      });

      this.classList.add("selected");
      const chk = this.querySelector(".pi-type-check");
      if (chk) chk.textContent = "✓";

      const selectedType = this.getAttribute("data-type") || "sell";
      formData.type = selectedType;

      // Update Step 3 Dynamic Fields visibility
      updateStep3FieldsVisibility(selectedType);
    });
  });
}

function updateStep3FieldsVisibility(type) {
  const sellFields = document.getElementById("pi-fields-sell");
  const donateFields = document.getElementById("pi-fields-donate");
  const lendFields = document.getElementById("pi-fields-lend");
  const exchangeFields = document.getElementById("pi-fields-exchange");
  const subTitle = document.getElementById("pi-step3-sub");

  if (sellFields) sellFields.style.display = (type === "sell") ? "block" : "none";
  if (donateFields) donateFields.style.display = (type === "donate") ? "block" : "none";
  if (lendFields) lendFields.style.display = (type === "lend") ? "block" : "none";
  if (exchangeFields) exchangeFields.style.display = (type === "exchange") ? "block" : "none";

  if (subTitle) {
    if (type === "donate") {
      subTitle.textContent = "Confirm free student donation pledge and campus pickup location.";
    } else if (type === "lend") {
      subTitle.textContent = "Set lending duration, security deposit, and pickup details.";
    } else if (type === "exchange") {
      subTitle.textContent = "List items you would like to swap for, plus pickup location.";
    } else {
      subTitle.textContent = "Set your selling price, negotiable terms, and pickup location.";
    }
  }
}

// ─── STEP 3: DETAILS VALIDATION ─────────────────────────────────────────────
window.validateAndGoToStep4 = function() {
  if (validateStep3()) {
    goToStep(4);
  }
};

function validateStep3() {
  let valid = true;
  const locInput = document.getElementById("pi-location");

  if (!locInput || !locInput.value.trim()) {
    document.getElementById("err-pi-location").style.display = "block";
    valid = false;
  } else {
    document.getElementById("err-pi-location").style.display = "none";
    formData.location = locInput.value.trim();
  }

  if (formData.type === "sell") {
    const priceInput = document.getElementById("pi-price");
    const origPriceInput = document.getElementById("pi-orig-price");
    const negCheck = document.getElementById("pi-negotiable");

    const pVal = parseFloat(priceInput ? priceInput.value : 0);
    if (isNaN(pVal) || pVal < 0) {
      document.getElementById("err-pi-price").style.display = "block";
      valid = false;
    } else {
      document.getElementById("err-pi-price").style.display = "none";
      formData.price = pVal;
      formData.originalPrice = parseFloat(origPriceInput ? origPriceInput.value : 0) || 0;
      formData.negotiable = !!(negCheck && negCheck.checked);
    }
  } else if (formData.type === "donate") {
    formData.price = 0;
    const confirmCheck = document.getElementById("pi-donate-confirm");
    formData.donateConfirmed = !!(confirmCheck && confirmCheck.checked);
  } else if (formData.type === "lend") {
    formData.price = 0;
    const durSelect = document.getElementById("pi-lend-duration");
    const depInput = document.getElementById("pi-lend-deposit");
    formData.lendDuration = durSelect ? durSelect.value : "1 Semester";
    formData.deposit = parseFloat(depInput ? depInput.value : 0) || 0;
  } else if (formData.type === "exchange") {
    formData.price = 0;
    const exchInput = document.getElementById("pi-exchange-for");
    if (!exchInput || !exchInput.value.trim()) {
      document.getElementById("err-pi-exchange-for").style.display = "block";
      valid = false;
    } else {
      document.getElementById("err-pi-exchange-for").style.display = "none";
      formData.exchangeFor = exchInput.value.trim();
    }
  }

  return valid;
}

// ─── STEP 4: PHOTOS UPLOAD & PREVIEWS ───────────────────────────────────────
function initStep4PhotoUpload() {
  const fileInput = document.getElementById("pi-file-input");
  const dropzone = document.getElementById("pi-dropzone");

  if (fileInput) {
    fileInput.addEventListener("change", function(e) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        if (file.size > 8 * 1024 * 1024) {
          showToast("Photo must be less than 8MB", "warning");
          return;
        }

        const reader = new FileReader();
        reader.onload = function(evt) {
          formData.photos.push(evt.target.result);
          renderPhotoPreviews();
        };
        reader.readAsDataURL(file);
      });
    });
  }

  // Drag and Drop handling
  if (dropzone) {
    ["dragenter", "dragover"].forEach(eventName => {
      dropzone.addEventListener(eventName, e => {
        e.preventDefault();
        dropzone.style.background = "#DBEAFE";
      });
    });

    ["dragleave", "drop"].forEach(eventName => {
      dropzone.addEventListener(eventName, e => {
        e.preventDefault();
        dropzone.style.background = "#F0F7FF";
      });
    });

    dropzone.addEventListener("drop", e => {
      const files = Array.from(e.dataTransfer.files);
      files.forEach(file => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = function(evt) {
            formData.photos.push(evt.target.result);
            renderPhotoPreviews();
          };
          reader.readAsDataURL(file);
        }
      });
    });
  }
}

window.addSamplePhoto = function(url) {
  if (!formData.photos.includes(url)) {
    formData.photos.push(url);
    renderPhotoPreviews();
    showToast("Photo added to listing!", "info");
  }
};

window.removePhoto = function(index) {
  formData.photos.splice(index, 1);
  renderPhotoPreviews();
};

function renderPhotoPreviews() {
  const grid = document.getElementById("pi-previews-grid");
  if (!grid) return;

  if (formData.photos.length === 0) {
    grid.innerHTML = "";
    return;
  }

  grid.innerHTML = formData.photos.map((src, i) => `
    <div class="pi-photo-preview">
      <img src="${src}" alt="Preview ${i + 1}" />
      <button type="button" class="pi-photo-remove" title="Remove Photo" onclick="removePhoto(${i})">✕</button>
    </div>
  `).join("");
}

// ─── STEP 5: REVIEW & PUBLISH ───────────────────────────────────────────────
function hydrateStep5Review() {
  const revImg = document.getElementById("review-preview-img");
  const revType = document.getElementById("review-badge-type");
  const revCat = document.getElementById("review-badge-cat");
  const revCond = document.getElementById("review-badge-cond");
  const revTitle = document.getElementById("review-title");
  const revPrice = document.getElementById("review-price");
  const revLoc = document.getElementById("review-location");
  const revDesc = document.getElementById("review-desc");

  const primaryPhoto = (formData.photos.length > 0) ? formData.photos[0] : (typeof getCategoryPlaceholderSvg === "function" ? getCategoryPlaceholderSvg(formData.category) : "");
  if (revImg) revImg.src = primaryPhoto;

  const type = formData.type;
  if (revType) {
    revType.textContent = type.toUpperCase();
    revType.className = `hp-listing-type-badge type-${type}`;
  }

  if (revCat) revCat.textContent = formData.category;
  if (revCond) revCond.textContent = formData.condition;
  if (revTitle) revTitle.textContent = formData.title;
  if (revLoc) revLoc.textContent = formData.location || "Campus Center";
  if (revDesc) revDesc.textContent = formData.description;

  // Price formatting
  if (revPrice) {
    if (type === "donate") {
      revPrice.innerHTML = `<span style="color: #16A34A;">FREE DONATION</span>`;
    } else if (type === "lend") {
      const depositStr = formData.deposit ? `(Deposit: ${typeof formatINR === 'function' ? formatINR(formData.deposit) : '₹' + formData.deposit})` : '';
      revPrice.innerHTML = `<span style="color: #EA580C; font-size: 1.4rem;">LEND • ${formData.lendDuration}</span> ${depositStr ? `<span style="font-size: 0.9rem; color: #64748B;">${depositStr}</span>` : ''}`;
    } else if (type === "exchange") {
      revPrice.innerHTML = `<span style="color: #1769FF; font-size: 1.4rem;">EXCHANGE</span> <div style="font-size: 0.85rem; color: #64748B; font-weight: 500;">For: "${formData.exchangeFor}"</div>`;
    } else {
      const priceFmt = typeof formatINR === 'function' ? formatINR(formData.price) : '₹' + formData.price;
      const origFmt = formData.originalPrice > formData.price ? (typeof formatINR === 'function' ? formatINR(formData.originalPrice) : '₹' + formData.originalPrice) : '';
      revPrice.innerHTML = `<span>${priceFmt}</span> ${origFmt ? `<span style="font-size: 1.1rem; color: #9CA3AF; text-decoration: line-through; margin-left: 8px;">${origFmt}</span>` : ''} ${formData.negotiable ? '<span class="badge badge-warning" style="margin-left: 8px; font-size: 0.75rem;">Negotiable</span>' : ''}`;
    }
  }
}

// ─── FINAL PUBLISH LISTING ──────────────────────────────────────────────────
window.publishListing = function() {
  const publishBtn = document.getElementById("pi-publish-btn");
  if (publishBtn) {
    publishBtn.disabled = true;
    publishBtn.textContent = "Publishing to Campus...";
  }

  // Ensure clean SVG placeholder photo if none provided
  const primaryPhoto = (formData.photos.length > 0) ? formData.photos[0] : (typeof getCategoryPlaceholderSvg === "function" ? getCategoryPlaceholderSvg(formData.category) : "");
  const allPhotos = (formData.photos.length > 0) ? formData.photos : [primaryPhoto];

  let priceDisplay = typeof formatINR === 'function' ? formatINR(formData.price) : `₹${formData.price}`;
  if (formData.type === "donate") {
    priceDisplay = "FREE";
  } else if (formData.type === "lend") {
    priceDisplay = formData.lendDuration ? `Lend • ${formData.lendDuration}` : "Lend";
  } else if (formData.type === "exchange") {
    priceDisplay = "Exchange";
  }

  // Create new item in localStorage
  const createdItem = saveItem({
    title: formData.title,
    category: formData.category,
    condition: formData.condition,
    description: formData.description,
    type: formData.type,
    price: formData.price,
    priceDisplay: priceDisplay,
    originalPrice: formData.originalPrice,
    negotiable: formData.negotiable,
    lendDuration: formData.lendDuration,
    deposit: formData.deposit,
    exchangeFor: formData.exchangeFor,
    location: formData.location,
    image: primaryPhoto,
    images: allPhotos
  });

  showToast("Listing published successfully! Redirecting...", "success");

  // Redirect to newly created item details page after brief celebration delay
  setTimeout(() => {
    window.location.href = getAppUrl(`item-details.html?id=${encodeURIComponent(createdItem.id)}`);
  }, 1200);
};
