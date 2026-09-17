/* ==========================================================================
   CampusShare - LocalStorage Manager Layer (Empty Start State)
   ========================================================================== */

const STORAGE_KEYS = {
  ITEMS: "campus_share_items",
  WISHLIST: "campus_share_wishlist",
  MESSAGES: "campus_share_messages",
  CURRENT_USER: "campus_share_user",
  USERS: "campus_share_all_users",
  RESET_FLAG: "campus_share_clean_v2"
};

// Initialize LocalStorage as completely empty for a clean state
function initStorage() {
  // Check if we need to purge old mock data
  if (!localStorage.getItem(STORAGE_KEYS.RESET_FLAG)) {
    localStorage.removeItem(STORAGE_KEYS.ITEMS);
    localStorage.removeItem(STORAGE_KEYS.WISHLIST);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.setItem(STORAGE_KEYS.RESET_FLAG, "true");
  }

  if (!localStorage.getItem(STORAGE_KEYS.ITEMS)) {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.WISHLIST)) {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify([]));
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
  return items.find(item => item.id === id) || null;
}

function saveItem(itemData) {
  const items = getItems();
  const currentUser = getCurrentUser();
  
  const newItem = {
    id: "item_" + Date.now(),
    title: itemData.title,
    category: itemData.category,
    price: parseFloat(itemData.price) || 0,
    originalPrice: parseFloat(itemData.originalPrice) || parseFloat(itemData.price),
    condition: itemData.condition,
    description: itemData.description,
    image: itemData.image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    images: [itemData.image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"],
    sellerId: currentUser ? currentUser.id : "usr_guest",
    sellerName: currentUser ? currentUser.name : "Student Seller",
    sellerUniversity: currentUser ? currentUser.university : "Campus Community",
    sellerAvatar: currentUser ? currentUser.avatar : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    location: itemData.location || "Campus Center",
    postedDate: "Just now",
    status: "active",
    views: 1,
    savedCount: 0,
    featured: false
  };

  items.unshift(newItem);
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  return newItem;
}

function updateItemStatus(id, newStatus) {
  const items = getItems();
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index].status = newStatus;
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    return true;
  }
  return false;
}

function deleteItem(id) {
  let items = getItems();
  items = items.filter(item => item.id !== id);
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
  return wishlist.includes(itemId);
}

function toggleWishlist(itemId) {
  let wishlist = getWishlist();
  let isAdded = false;
  
  if (wishlist.includes(itemId)) {
    wishlist = wishlist.filter(id => id !== itemId);
  } else {
    wishlist.push(itemId);
    isAdded = true;
  }

  localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  
  // Update saved count on item
  const items = getItems();
  const item = items.find(i => i.id === itemId);
  if (item) {
    item.savedCount = isAdded ? (item.savedCount + 1) : Math.max(0, item.savedCount - 1);
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  }

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

function sendMessage(convId, text) {
  const conversations = getMessages();
  const conv = conversations.find(c => c.id === convId);
  const currentUser = getCurrentUser();

  if (conv) {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      senderId: currentUser ? currentUser.id : "usr_guest",
      text: text,
      timestamp: timeNow
    };
    conv.messages.push(userMsg);
    conv.lastUpdated = "Just now";
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(conversations));
    return userMsg;
  }
  return null;
}

function createConversation(item, initialText) {
  const conversations = getMessages();
  const existing = conversations.find(c => c.itemId === item.id);
  const currentUser = getCurrentUser();
  
  if (existing) {
    if (initialText) {
      sendMessage(existing.id, initialText);
    }
    return existing.id;
  }

  const newConvId = "conv_" + Date.now();
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newConv = {
    id: newConvId,
    itemId: item.id,
    itemTitle: item.title,
    itemImage: item.image,
    price: item.price,
    otherUser: {
      id: item.sellerId,
      name: item.sellerName,
      avatar: item.sellerAvatar,
      status: "online"
    },
    lastUpdated: "Just now",
    unread: false,
    messages: [
      {
        senderId: currentUser ? currentUser.id : "usr_guest",
        text: initialText || `Hi ${item.sellerName}, I'm interested in your "${item.title}". Is it still available?`,
        timestamp: timeNow
      }
    ]
  };

  conversations.unshift(newConv);
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(conversations));
  return newConvId;
}

// User Authentication & Session
function getCurrentUser() {
  initStorage();
  try {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
}

function setCurrentUser(userObj) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userObj));
}

function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// Clear all data helper
function clearAllAppData() {
  localStorage.removeItem(STORAGE_KEYS.ITEMS);
  localStorage.removeItem(STORAGE_KEYS.WISHLIST);
  localStorage.removeItem(STORAGE_KEYS.MESSAGES);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  localStorage.removeItem(STORAGE_KEYS.USERS);
  initStorage();
}

// Auto-run initialization on script load
initStorage();
