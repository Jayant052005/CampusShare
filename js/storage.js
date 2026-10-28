/* ==========================================================================
   CampusShare - LocalStorage Manager Layer
   ========================================================================== */

const STORAGE_KEYS = {
  ITEMS: "campus_share_items",
  WISHLIST: "campus_share_wishlist",
  MESSAGES: "campus_share_messages",
  CURRENT_USER: "campus_share_user",
  USERS: "campus_share_all_users",
  RESET_FLAG: "campus_share_catalog_v5"
};

// Initialize LocalStorage with rich mock dataset or persist user data
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.RESET_FLAG)) {
    // Preserve any existing wishlist if possible, but load complete updated items catalog
    const oldWishlist = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    localStorage.removeItem(STORAGE_KEYS.ITEMS);
    localStorage.setItem(STORAGE_KEYS.RESET_FLAG, "true");
    if (!oldWishlist) {
      // Default initial wishlist with 2 items to showcase saved items
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(["1", "3"]));
    }
  }

  if (!localStorage.getItem(STORAGE_KEYS.ITEMS) || JSON.parse(localStorage.getItem(STORAGE_KEYS.ITEMS) || "[]").length === 0) {
    const defaultItems = (typeof INITIAL_ITEMS !== 'undefined' && Array.isArray(INITIAL_ITEMS)) ? INITIAL_ITEMS : [];
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(defaultItems));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const defaultUsers = (typeof INITIAL_USERS !== 'undefined' && Array.isArray(INITIAL_USERS)) ? INITIAL_USERS : [];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.WISHLIST)) {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(["1", "3"]));
  }
}

// Items Data Access
function getItems() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ITEMS)) || [];
  } catch (e) {
    return [];
  }
}

function getItemById(id) {
  const items = getItems();
  return items.find(item => String(item.id) === String(id)) || null;
}

function saveItem(itemData) {
  const items = getItems();
  const currentUser = getCurrentUser();
  
  const type = (itemData.type || "sell").toLowerCase();
  const priceVal = parseFloat(itemData.price) || 0;
  
  let priceDisplay = `$${priceVal}`;
  if (type === "donate") {
    priceDisplay = "FREE";
  } else if (type === "lend") {
    priceDisplay = itemData.lendDuration ? `Lend • ${itemData.lendDuration}` : "Lend";
  } else if (type === "exchange") {
    priceDisplay = "Exchange";
  }

  const primaryImage = itemData.image || (itemData.images && itemData.images[0]) || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80";
  const allImages = (itemData.images && itemData.images.length > 0) ? itemData.images : [primaryImage];

  const newItem = {
    id: "item_" + Date.now(),
    title: itemData.title,
    category: itemData.category || "Other",
    type: type,
    price: priceVal,
    priceDisplay: priceDisplay,
    originalPrice: parseFloat(itemData.originalPrice) || (priceVal > 0 ? priceVal * 1.5 : 0),
    condition: itemData.condition || "Like New",
    description: itemData.description || "",
    image: primaryImage,
    images: allImages,
    sellerId: currentUser ? currentUser.id : "usr_alex",
    sellerName: currentUser ? currentUser.name : "Alex Chen",
    sellerUniversity: currentUser ? currentUser.university : "Stanford University",
    sellerAvatar: currentUser ? currentUser.avatar : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    location: itemData.location || "Campus Center",
    postedDate: "Just now",
    status: "active",
    views: 1,
    savedCount: 0,
    rating: 5.0,
    reviewsCount: 1,
    verified: true,
    negotiable: !!itemData.negotiable,
    lendDuration: itemData.lendDuration || "",
    deposit: parseFloat(itemData.deposit) || 0,
    exchangeFor: itemData.exchangeFor || ""
  };

  items.unshift(newItem);
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  return newItem;
}

function updateItemStatus(id, newStatus) {
  const items = getItems();
  const index = items.findIndex(item => String(item.id) === String(id));
  if (index !== -1) {
    items[index].status = newStatus;
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    return true;
  }
  return false;
}

function deleteItem(id) {
  let items = getItems();
  items = items.filter(item => String(item.id) !== String(id));
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
}

// Wishlist Access
function getWishlist() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.WISHLIST)) || [];
  } catch (e) {
    return [];
  }
}

function isWishlisted(itemId) {
  const wishlist = getWishlist();
  return wishlist.includes(String(itemId));
}

function toggleWishlist(itemId) {
  let wishlist = getWishlist();
  const sId = String(itemId);
  let isAdded = false;
  
  if (wishlist.includes(sId)) {
    wishlist = wishlist.filter(id => id !== sId);
  } else {
    wishlist.push(sId);
    isAdded = true;
  }

  localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  
  // Update saved count on item
  const items = getItems();
  const item = items.find(i => String(i.id) === sId);
  if (item) {
    item.savedCount = isAdded ? ((item.savedCount || 0) + 1) : Math.max(0, (item.savedCount || 0) - 1);
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  }

  // Dispatch custom event so all listeners sync
  document.dispatchEvent(new CustomEvent("wishlistUpdated", { detail: { itemId: sId, added: isAdded, count: wishlist.length } }));

  return isAdded;
}

// Messages & Conversations Access
function getMessages() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES)) || [];
  } catch (e) {
    return [];
  }
}

function sendMessage(senderId, receiverId, itemId, text) {
  const messages = getMessages();
  const newMsg = {
    id: "msg_" + Date.now(),
    senderId,
    receiverId,
    itemId,
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date().toLocaleDateString()
  };
  messages.push(newMsg);
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  return newMsg;
}

// Current User Mock Authentication
function getCurrentUser() {
  initStorage();
  const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch (e) {}
  }
  return {
    id: "usr_alex",
    name: "Alex Chen",
    email: "alex@stanford.edu",
    university: "Stanford University",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    verified: true,
    rating: 4.9,
    major: "Computer Science & EE",
    joinedDate: "Fall 2024",
    reviewsCount: 38
  };
}

function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}
