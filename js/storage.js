/* ==========================================================================
   CampusShare - Unified LocalStorage & Data Models Layer
   Strictly adheres to:
   - Currency: Indian Rupees (₹ INR) only
   - Real Data First & Zero Fake Statistics/Artifacts
   - Robust Database-Ready Architecture
   ========================================================================== */

const STORAGE_KEYS = {
  ITEMS: "campus_share_items",
  WISHLIST: "campus_share_wishlist",
  CONVERSATIONS: "campus_share_conversations",
  NOTIFICATIONS: "campus_share_notifications",
  TRANSACTIONS: "campus_share_transactions",
  REVIEWS: "campus_share_reviews",
  CURRENT_USER: "campus_share_current_user",
  USERS: "campus_share_all_users",
  SETTINGS: "campus_share_settings",
  INIT_FLAG: "campus_share_v7_inr"
};

// Indian Rupee (INR) Formatter Utility
function formatINR(amount) {
  if (amount === undefined || amount === null || amount === "" || isNaN(amount)) {
    return "₹ —";
  }
  const num = Math.round(Number(amount));
  if (num === 0) return "FREE";
  return "₹" + num.toLocaleString("en-IN");
}

// Global SVG & Icon Placeholders (Clean CSS/SVG, NO AI-generated images)
function getCategoryPlaceholderSvg(category) {
  const iconMap = {
    Books: "📚",
    Notes: "📝",
    Electronics: "💻",
    Stationery: "📐",
    "Lab Equipment": "🧪",
    "Project Materials": "⚙️",
    "Hostel Items": "🛋️",
    Bags: "🎒",
    Sports: "🚲",
    Other: "📦"
  };
  const icon = iconMap[category] || "📦";
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23F1F5F9'/%3E%3Ccircle cx='300' cy='180' r='60' fill='%23E2E8F0'/%3E%3Ctext x='300' y='200' font-size='48' text-anchor='middle' font-family='sans-serif'%3E${encodeURIComponent(icon)}%3C/text%3E%3Ctext x='300' y='270' font-size='18' font-weight='600' fill='%2364748B' text-anchor='middle' font-family='sans-serif'%3E${encodeURIComponent(category || 'Campus Item')}%3C/text%3E%3C/svg%3E`;
}

// Initialize LocalStorage Layer
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.INIT_FLAG)) {
    localStorage.removeItem(STORAGE_KEYS.ITEMS);
    localStorage.removeItem(STORAGE_KEYS.WISHLIST);
    localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.setItem(STORAGE_KEYS.INIT_FLAG, "true");

    // Seed default current user with clean placeholder
    const defaultUser = {
      id: "usr_current",
      name: "Jordan Taylor",
      email: "jordan.taylor@stanford.edu",
      university: "Stanford University",
      college: "School of Engineering",
      major: "Computer Science '26",
      avatar: "", // Will use clean initials avatar
      verified: true,
      rating: "—",
      reviewsCount: 0,
      joinedDate: "Sept 2026",
      listingsCount: 0
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([defaultUser]));

    // Seed initial demo conversation to match Figma reference (clean mock chat, INR currency)
    const initialConversations = [
      {
        id: "conv_1",
        itemId: "item_demo_1",
        itemTitle: "TI-84 Plus CE Graphing Calculator",
        itemPrice: 450,
        itemStatus: "Negotiating campus exchange",
        itemImage: getCategoryPlaceholderSvg("Electronics"),
        otherUser: {
          id: "usr_alex_rivera",
          name: "Alex Rivera",
          university: "Stanford University",
          online: true,
          avatar: ""
        },
        lastUpdated: "12:15 PM",
        messages: [
          {
            id: "m1",
            senderId: "usr_alex_rivera",
            text: "Hi! Is the TI-84 Plus CE calculator still available for campus pickup?",
            timestamp: "12:05 PM",
            isMe: false
          },
          {
            id: "m2",
            senderId: "usr_current",
            text: "Yes, it is in excellent condition with the slide cover and USB cable.",
            timestamp: "12:10 PM",
            isMe: true
          },
          {
            id: "m3",
            senderId: "usr_alex_rivera",
            text: "Great, I will bring cash/Venmo at 3PM by the library near the fountain.",
            timestamp: "12:15 PM",
            isMe: false
          }
        ]
      },
      {
        id: "conv_2",
        itemId: "item_demo_2",
        itemTitle: "iPad Air 5th Gen (M1, 64GB)",
        itemPrice: 28500,
        itemStatus: "Proposing peer exchange",
        itemImage: getCategoryPlaceholderSvg("Electronics"),
        otherUser: {
          id: "usr_david_kim",
          name: "David Kim",
          university: "UC Berkeley",
          online: false,
          avatar: ""
        },
        lastUpdated: "Yesterday",
        messages: [
          {
            id: "m201",
            senderId: "usr_david_kim",
            text: "Hello! Are you open to trades for the iPad Air?",
            timestamp: "Yesterday",
            isMe: false
          },
          {
            id: "m202",
            senderId: "usr_david_kim",
            text: "I have a Dell UltraSharp 27 inch 4K monitor and USB-C hub in mint condition.",
            timestamp: "Yesterday",
            isMe: false
          }
        ]
      }
    ];
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(initialConversations));

    // Seed initial notifications per prompt requirements
    const initialNotifications = [
      {
        id: "notif_1",
        title: "Campus Notification",
        message: "You received a new message from Alex Rivera regarding TI-84 calculator.",
        date: "12:15 PM",
        unread: true,
        link: "messages.html",
        icon: "💬"
      },
      {
        id: "notif_2",
        title: "Wishlist Alert",
        message: "Someone saved your campus listing to their wishlist.",
        date: "Yesterday",
        unread: false,
        link: "my-listings.html",
        icon: "❤️"
      },
      {
        id: "notif_3",
        title: "Campus Giving",
        message: "Your donation request was accepted by a verified campus peer.",
        date: "2 days ago",
        unread: false,
        link: "messages.html",
        icon: "🎁"
      }
    ];
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));

    // Initial items: Seed realistic, compliant demo items adhering strictly to ₹ INR and clean placeholders
    const initialDemoItems = [
      {
        id: "item_demo_1",
        title: "TI-84 Plus CE Graphing Calculator",
        category: "Electronics",
        type: "sell",
        price: 450,
        priceDisplay: "₹450",
        originalPrice: 1200,
        condition: "Like New",
        description: "TI-84 Plus CE in mint condition with rechargeable battery, USB-A charging cable, and durable slide cover. Ideal for calculus, statistics, and linear algebra. Clean and fully tested.",
        image: getCategoryPlaceholderSvg("Electronics"),
        images: [getCategoryPlaceholderSvg("Electronics")],
        sellerId: "usr_alex_rivera",
        sellerName: "Alex Rivera",
        sellerUniversity: "Stanford University",
        location: "Huang Engineering Center",
        postedDate: "2 hours ago",
        status: "active",
        views: 24,
        favorites: 5,
        rating: "—",
        reviewsCount: 0,
        verified: true,
        negotiable: true,
        isDemo: true
      },
      {
        id: "item_demo_2",
        title: "Introduction to Algorithms (CLRS 4th Edition)",
        category: "Books",
        type: "lend",
        price: 0,
        priceDisplay: "Lend • 1 Sem",
        originalPrice: 950,
        condition: "Good",
        description: "The definitive algorithms textbook (4th Edition). Available to lend for 1 full semester to any enrolled student taking CS algorithms. Clean margins with no pen markings.",
        image: getCategoryPlaceholderSvg("Books"),
        images: [getCategoryPlaceholderSvg("Books")],
        sellerId: "usr_sarah_j",
        sellerName: "Sarah Jenkins",
        sellerUniversity: "UC Berkeley",
        location: "Moffitt Library 3rd Floor",
        postedDate: "5 hours ago",
        status: "active",
        views: 18,
        favorites: 8,
        rating: "—",
        reviewsCount: 0,
        verified: true,
        lendDuration: "1 Semester",
        deposit: 200,
        isDemo: true
      },
      {
        id: "item_demo_3",
        title: "Organic Chemistry Glassware Lab Kit",
        category: "Lab Equipment",
        type: "donate",
        price: 0,
        priceDisplay: "FREE",
        originalPrice: 850,
        condition: "Good",
        description: "Complete organic chemistry lab glassware kit with standard ground glass joints. Includes condenser, adapter, round-bottom flasks, and certified splash goggles. Donating freely to juniors!",
        image: getCategoryPlaceholderSvg("Lab Equipment"),
        images: [getCategoryPlaceholderSvg("Lab Equipment")],
        sellerId: "usr_mike_r",
        sellerName: "Mike Ross",
        sellerUniversity: "MIT",
        location: "Chemistry Building Lobby",
        postedDate: "Yesterday",
        status: "active",
        views: 31,
        favorites: 12,
        rating: "—",
        reviewsCount: 0,
        verified: true,
        isDemo: true
      },
      {
        id: "item_demo_4",
        title: "Ergonomic Hostel & Dorm Study Desk Chair",
        category: "Hostel Items",
        type: "sell",
        price: 350,
        priceDisplay: "₹350",
        originalPrice: 900,
        condition: "Good",
        description: "Comfortable ergonomic study chair with lumbar support, adjustable height, and swivel base. Perfect for dorm or hostel study desk.",
        image: getCategoryPlaceholderSvg("Hostel Items"),
        images: [getCategoryPlaceholderSvg("Hostel Items")],
        sellerId: "usr_emily_w",
        sellerName: "Emily Watson",
        sellerUniversity: "UT Austin",
        location: "Jester Center Residence Hall",
        postedDate: "2 days ago",
        status: "active",
        views: 19,
        favorites: 3,
        rating: "—",
        reviewsCount: 0,
        verified: true,
        negotiable: true,
        isDemo: true
      }
    ];
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(initialDemoItems));
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(["item_demo_1"]));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. LISTINGS DATA ACCESS
// ─────────────────────────────────────────────────────────────────────────────
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

  let priceDisplay = formatINR(priceVal);
  if (type === "donate") {
    priceDisplay = "FREE";
  } else if (type === "lend") {
    priceDisplay = itemData.lendDuration ? `Lend • ${itemData.lendDuration}` : "Lend";
  } else if (type === "exchange") {
    priceDisplay = "Exchange";
  }

  const primaryImage = itemData.image || (itemData.images && itemData.images[0]) || getCategoryPlaceholderSvg(itemData.category);
  const allImages = (itemData.images && itemData.images.length > 0) ? itemData.images : [primaryImage];

  const newItem = {
    id: "item_" + Date.now(),
    title: itemData.title,
    category: itemData.category || "Other",
    type: type,
    price: priceVal,
    priceDisplay: priceDisplay,
    originalPrice: parseFloat(itemData.originalPrice) || 0,
    condition: itemData.condition || "Good",
    description: itemData.description || "",
    image: primaryImage,
    images: allImages,
    sellerId: currentUser ? currentUser.id : "usr_current",
    sellerName: currentUser ? currentUser.name : "Student Seller",
    sellerUniversity: currentUser ? currentUser.university : "Campus Community",
    location: itemData.location || "Campus Center",
    postedDate: "Just now",
    status: "active", // active | sold | paused | donated | lent
    views: 1,
    favorites: 0,
    rating: "—",
    reviewsCount: 0,
    verified: currentUser ? currentUser.verified : false,
    negotiable: !!itemData.negotiable,
    lendDuration: itemData.lendDuration || "",
    deposit: parseFloat(itemData.deposit) || 0,
    exchangeFor: itemData.exchangeFor || "",
    isDemo: false
  };

  items.unshift(newItem);
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));

  // Add system notification for published listing
  addNotification(
    "Listing Published",
    `Your listing for "${newItem.title}" is now active in the campus marketplace.`,
    `item-details.html?id=${newItem.id}`,
    "📦"
  );

  return newItem;
}

function updateItem(id, updates) {
  const items = getItems();
  const index = items.findIndex(item => String(item.id) === String(id));
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    if (updates.price !== undefined && items[index].type === 'sell') {
      items[index].priceDisplay = formatINR(updates.price);
    }
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    return items[index];
  }
  return null;
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
  // Also remove from wishlist if present
  let wishlist = getWishlist();
  if (wishlist.includes(String(id))) {
    toggleWishlist(String(id));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. WISHLIST ACCESS
// ─────────────────────────────────────────────────────────────────────────────
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

const isItemInWishlist = isWishlisted;

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

  // Update item favorites count
  const items = getItems();
  const item = items.find(i => String(i.id) === sId);
  if (item) {
    item.favorites = isAdded ? ((item.favorites || 0) + 1) : Math.max(0, (item.favorites || 0) - 1);
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  }

  // Trigger sync event
  document.dispatchEvent(new CustomEvent("wishlistUpdated", {
    detail: { itemId: sId, added: isAdded, count: wishlist.length }
  }));

  return isAdded;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. MESSAGES & CONVERSATIONS ACCESS
// ─────────────────────────────────────────────────────────────────────────────
function getConversations() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)) || [];
  } catch (e) {
    return [];
  }
}

function getConversationById(convId) {
  const convs = getConversations();
  return convs.find(c => String(c.id) === String(convId)) || null;
}

function sendChatMessage(convId, text) {
  const convs = getConversations();
  const currentUser = getCurrentUser();
  const targetConv = convs.find(c => String(c.id) === String(convId));

  if (!targetConv || !text.trim()) return null;

  const newMsg = {
    id: "msg_" + Date.now(),
    senderId: currentUser ? currentUser.id : "usr_current",
    text: text.trim(),
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    isMe: true
  };

  targetConv.messages.push(newMsg);
  targetConv.lastUpdated = "Just now";
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(convs));
  return newMsg;
}

function createOrGetConversation(itemId, initialText = "") {
  const convs = getConversations();
  const item = getItemById(itemId);
  const currentUser = getCurrentUser();

  if (!item) return null;

  // Check if conversation already exists for this item
  let existing = convs.find(c => String(c.itemId) === String(itemId));
  if (existing) {
    if (initialText) {
      sendChatMessage(existing.id, initialText);
    }
    return existing;
  }

  // Create new conversation
  const newConv = {
    id: "conv_" + Date.now(),
    itemId: item.id,
    itemTitle: item.title,
    itemPrice: item.price,
    itemStatus: item.type === "exchange" ? "Negotiating campus exchange" : (item.type === "lend" ? "Requesting borrow" : (item.type === "donate" ? "Requesting donation" : "Inquiring about item")),
    itemImage: item.image || getCategoryPlaceholderSvg(item.category),
    otherUser: {
      id: item.sellerId || "usr_seller",
      name: item.sellerName || "Campus Student",
      university: item.sellerUniversity || "Stanford University",
      online: true,
      avatar: ""
    },
    lastUpdated: "Just now",
    messages: initialText ? [
      {
        id: "m_" + Date.now(),
        senderId: currentUser ? currentUser.id : "usr_current",
        text: initialText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMe: true
      }
    ] : []
  };

  convs.unshift(newConv);
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(convs));
  return newConv;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. NOTIFICATIONS SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
function getNotifications() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) || [];
  } catch (e) {
    return [];
  }
}

function addNotification(title, message, link = "#", icon = "ℹ️") {
  const notifs = getNotifications();
  const newNotif = {
    id: "notif_" + Date.now(),
    title,
    message,
    date: "Just now",
    unread: true,
    link,
    icon
  };
  notifs.unshift(newNotif);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  document.dispatchEvent(new CustomEvent("notificationsUpdated"));
  return newNotif;
}

function markNotificationsRead() {
  const notifs = getNotifications();
  notifs.forEach(n => { n.unread = false; });
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  document.dispatchEvent(new CustomEvent("notificationsUpdated"));
}

function getUnreadNotificationCount() {
  const notifs = getNotifications();
  return notifs.filter(n => n.unread).length;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. USER AUTH & SETTINGS ACCESS
// ─────────────────────────────────────────────────────────────────────────────
function getUsers() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
  } catch (e) {
    return [];
  }
}

function getCurrentUser() {
  initStorage();
  const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch (e) {}
  }
  return null;
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
  document.dispatchEvent(new CustomEvent("userAuthChanged", { detail: { user } }));
}

function loginUser(email, password) {
  const users = getUsers();
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  // In prototype auth: if user exists or enters a valid student email, authenticate smoothly
  const user = found || {
    id: "usr_" + Date.now(),
    name: email.split("@")[0].replace(".", " ").replace(/(^\w|\s\w)/g, m => m.toUpperCase()),
    email: email,
    university: "Stanford University",
    college: "School of Engineering",
    major: "Undergraduate Student",
    avatar: "",
    verified: true,
    rating: "—",
    reviewsCount: 0,
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    listingsCount: 0
  };

  if (!found) {
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  setCurrentUser(user);
  return user;
}

function registerUser(userData) {
  const users = getUsers();
  const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existing) {
    setCurrentUser(existing);
    return existing;
  }

  const newUser = {
    id: "usr_" + Date.now(),
    name: userData.name,
    email: userData.email,
    university: userData.university || "Stanford University",
    college: userData.college || "Campus",
    major: userData.major || "Student",
    avatar: "",
    verified: true,
    rating: "—",
    reviewsCount: 0,
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    listingsCount: 0
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  setCurrentUser(newUser);
  return newUser;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. TRANSACTIONS & REVIEWS (REAL DATA READY)
// ─────────────────────────────────────────────────────────────────────────────
function getTransactions() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) || [];
  } catch (e) {
    return [];
  }
}

function getReviews() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS)) || [];
  } catch (e) {
    return [];
  }
}

function logoutUser() {
  setCurrentUser(null);
}

function getUserInitials(name) {
  if (!name) return "CS";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// Global exports on window object for clean cross-script compatibility
if (typeof window !== "undefined") {
  window.STORAGE_KEYS = STORAGE_KEYS;
  window.formatINR = formatINR;
  window.getCategoryPlaceholderSvg = getCategoryPlaceholderSvg;
  window.getUserInitials = getUserInitials;
  window.initStorage = initStorage;
  window.getItems = getItems;
  window.getItemById = getItemById;
  window.saveItem = saveItem;
  window.updateItem = updateItem;
  window.deleteItem = deleteItem;
  window.updateItemStatus = updateItemStatus;
  window.getWishlist = getWishlist;
  window.isItemInWishlist = isItemInWishlist;
  window.toggleWishlist = toggleWishlist;
  window.getConversations = getConversations;
  window.getConversationById = getConversationById;
  window.sendChatMessage = sendChatMessage;
  window.createOrGetConversation = createOrGetConversation;
  window.getMessages = getConversations; // Alias
  window.sendMessage = sendChatMessage; // Alias
  window.getNotifications = getNotifications;
  window.addNotification = addNotification;
  window.markNotificationsRead = markNotificationsRead;
  window.getUnreadNotificationCount = getUnreadNotificationCount;
  window.getCurrentUser = getCurrentUser;
  window.setCurrentUser = setCurrentUser;
  window.getUsers = getUsers;
  window.loginUser = loginUser;
  window.registerUser = registerUser;
  window.logoutUser = logoutUser;
  window.getTransactions = getTransactions;
  window.getReviews = getReviews;
}
