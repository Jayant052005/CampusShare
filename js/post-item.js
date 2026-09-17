/* ==========================================================================
   CampusShare - Post Item Controller
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("post-item-form");
  if (!form) return;

  const photoInput = document.getElementById("item-photo-input");
  const photoPreview = document.getElementById("photo-preview-container");

  let uploadedImageBase64 = null;

  // Handle Photo Preview
  if (photoInput && photoPreview) {
    photoInput.addEventListener("change", function(e) {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          showToast("Image size must be less than 5MB", "warning");
          return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
          uploadedImageBase64 = event.target.result;
          photoPreview.innerHTML = `
            <div style="position: relative; width: 140px; height: 140px; border-radius: var(--radius-md); overflow: hidden; border: 2px solid var(--blue);">
              <img src="${uploadedImageBase64}" alt="Upload Preview" style="width: 100%; height: 100%; object-fit: cover;" />
              <button type="button" onclick="removePhotoPreview()" style="position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;">✕</button>
            </div>
          `;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  window.removePhotoPreview = function() {
    uploadedImageBase64 = null;
    if (photoInput) photoInput.value = "";
    if (photoPreview) {
      photoPreview.innerHTML = `
        <div style="border: 2px dashed var(--border); border-radius: var(--radius-md); padding: 32px 16px; text-align: center; background: var(--background); cursor: pointer;" onclick="document.getElementById('item-photo-input').click()">
          <div style="font-size: 2rem; margin-bottom: 8px;">📷</div>
          <div style="font-weight: 600; color: var(--navy);">Click to upload item photos</div>
          <div style="font-size: 0.8rem; color: var(--secondary-text);">PNG, JPG, or WEBP up to 5MB</div>
        </div>
      `;
    }
  };

  // Preset Sample Image Quick Selectors
  window.selectSamplePhoto = function(url) {
    uploadedImageBase64 = url;
    if (photoPreview) {
      photoPreview.innerHTML = `
        <div style="position: relative; width: 140px; height: 140px; border-radius: var(--radius-md); overflow: hidden; border: 2px solid var(--blue);">
          <img src="${url}" alt="Sample Preview" style="width: 100%; height: 100%; object-fit: cover;" />
          <button type="button" onclick="removePhotoPreview()" style="position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;">✕</button>
        </div>
      `;
    }
    showToast("Sample image selected", "info");
  };

  // Form Submission
  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const title = document.getElementById("item-title").value.trim();
    const category = document.getElementById("item-category").value;
    const price = document.getElementById("item-price").value;
    const originalPrice = document.getElementById("item-original-price").value;
    const condition = document.getElementById("item-condition").value;
    const location = document.getElementById("item-location").value.trim();
    const description = document.getElementById("item-description").value.trim();

    if (!title || !category || !price || !condition || !description) {
      showToast("Please fill in all required fields", "warning");
      return;
    }

    const defaultImages = {
      textbooks: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
      electronics: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
      dorm: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80",
      sports: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
      services: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
    };

    const finalImage = uploadedImageBase64 || defaultImages[category] || defaultImages.textbooks;

    const newItem = saveItem({
      title,
      category,
      price,
      originalPrice: originalPrice || price,
      condition,
      location,
      description,
      image: finalImage
    });

    showToast("Listing published successfully!", "success");

    setTimeout(() => {
      window.location.href = `item-details.html?id=${newItem.id}`;
    }, 800);
  });
});
