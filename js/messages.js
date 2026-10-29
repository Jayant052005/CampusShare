/* ==========================================================================
   CampusShare - Unified Messaging & Campus Peer Chat System
   Strictly adheres to:
   - Currency: Indian Rupees (₹ INR) only
   - Clean SVG/Initials Avatars (NO AI portraits)
   - Two-column desktop, list-first mobile with back navigation
   - LocalStorage persistence with verified encryption badge
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function() {
  const container = document.getElementById("cs-msg-container");
  const convListContainer = document.getElementById("cs-conv-list");
  const chatPane = document.getElementById("cs-chat-pane");
  const searchInput = document.getElementById("cs-msg-search");

  if (!convListContainer || !chatPane) return;

  // Initialize storage layer
  if (typeof initStorage === "function") initStorage();

  // State
  let conversations = getConversations();
  let searchQuery = "";
  let activeConvId = null;

  // Check URL params for targeted conversation or item
  const urlParams = new URLSearchParams(window.location.search);
  const targetConvParam = urlParams.get("conv");
  const targetItemParam = urlParams.get("item") || urlParams.get("id");

  if (targetConvParam) {
    const found = conversations.find(c => String(c.id) === String(targetConvParam));
    if (found) activeConvId = found.id;
  } else if (targetItemParam) {
    const existingOrNew = createOrGetConversation(targetItemParam);
    if (existingOrNew) {
      conversations = getConversations();
      activeConvId = existingOrNew.id;
    }
  }

  // Default to first conversation if none selected
  if (!activeConvId && conversations.length > 0) {
    activeConvId = conversations[0].id;
  }

  // Bind Search Input
  if (searchInput) {
    searchInput.addEventListener("input", function() {
      searchQuery = this.value.trim().toLowerCase();
      renderConversationList();
    });
  }

  // Main Render Function
  function renderAll() {
    conversations = getConversations();
    renderConversationList();
    renderChatThread();
  }

  // Render Conversation Directory List
  function renderConversationList() {
    let filtered = conversations;
    if (searchQuery) {
      filtered = conversations.filter(c => {
        const userName = (c.otherUser && c.otherUser.name ? c.otherUser.name : "").toLowerCase();
        const itemTitle = (c.itemTitle || "").toLowerCase();
        const lastMsg = c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1].text.toLowerCase() : "";
        return userName.includes(searchQuery) || itemTitle.includes(searchQuery) || lastMsg.includes(searchQuery);
      });
    }

    if (filtered.length === 0) {
      convListContainer.innerHTML = `
        <div style="padding: 36px 20px; text-align: center; color: var(--secondary-text);">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">💬</div>
          <div style="font-weight: 700; color: var(--navy); margin-bottom: 4px;">No Conversations Found</div>
          <div style="font-size: 0.85rem;">Try searching for a different peer or campus item.</div>
        </div>
      `;
      return;
    }

    convListContainer.innerHTML = filtered.map(conv => {
      const isActive = conv.id === activeConvId;
      const other = conv.otherUser || { name: "Campus Student", university: "Stanford University", online: true };
      const initials = typeof getUserInitials === "function" ? getUserInitials(other.name) : (other.name ? other.name.slice(0, 2).toUpperCase() : "CS");
      
      const lastMsg = conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;
      const previewText = lastMsg ? lastMsg.text : (conv.itemStatus || "No messages yet");
      const timeDisplay = lastMsg ? lastMsg.timestamp : conv.lastUpdated || "Recently";

      return `
        <div class="cs-conv-item ${isActive ? 'active' : ''}" onclick="window.selectConversation('${conv.id}')" role="tab" aria-selected="${isActive}">
          <div class="cs-conv-avatar-wrap">
            <div class="cs-avatar-circle">${initials}</div>
            ${other.online !== false ? '<span class="cs-online-dot" title="Online on Campus"></span>' : ''}
          </div>
          <div class="cs-conv-content">
            <div class="cs-conv-top-row">
              <span class="cs-conv-name">${other.name}</span>
              <span class="cs-conv-time">${timeDisplay}</span>
            </div>
            <div class="cs-conv-item-title">${conv.itemTitle || "Campus Listing"}</div>
            <div class="cs-conv-preview">${previewText}</div>
          </div>
        </div>
      `;
    }).join("");
  }

  // Render Active Chat Thread
  function renderChatThread() {
    const activeConv = conversations.find(c => String(c.id) === String(activeConvId));

    if (!activeConv) {
      chatPane.innerHTML = `
        <div class="cs-chat-empty-state">
          <div class="cs-chat-empty-icon">📬</div>
          <h3 style="color: var(--navy); margin-bottom: 8px;">Select a Conversation</h3>
          <p style="max-width: 360px; margin: 0 auto 20px auto; font-size: 0.95rem;">
            Choose a message from the list on the left to chat with student buyers or sellers.
          </p>
        </div>
      `;
      return;
    }

    const other = activeConv.otherUser || { name: "Campus Student", university: "Stanford University", online: true };
    const initials = typeof getUserInitials === "function" ? getUserInitials(other.name) : "CS";
    const currentUser = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    const currentUserId = currentUser ? currentUser.id : "usr_current";

    // Format item price in INR
    const priceFormatted = typeof formatINR === "function" ? formatINR(activeConv.itemPrice || activeConv.price || 0) : "₹" + (activeConv.itemPrice || 0);
    const detailUrl = typeof getAppUrl === "function" ? (activeConv.itemId ? getAppUrl("item-details.html?id=" + activeConv.itemId) : getAppUrl("explore.html")) : (activeConv.itemId ? "item-details.html?id=" + activeConv.itemId : "explore.html");

    chatPane.innerHTML = `
      <!-- 1. CHAT HEADER -->
      <div class="cs-chat-header">
        <div class="cs-chat-user-info">
          <button type="button" class="cs-mobile-back-btn" onclick="window.closeMobileChat()" aria-label="Back to conversations">
            ← Back
          </button>
          <div class="cs-conv-avatar-wrap">
            <div class="cs-avatar-circle sm">${initials}</div>
            ${other.online !== false ? '<span class="cs-online-dot"></span>' : ''}
          </div>
          <div>
            <h3 style="margin: 0; font-size: 1.05rem; font-weight: 700; color: var(--navy); line-height: 1.2;">
              ${other.name}
            </h3>
            <span style="font-size: 0.8rem; color: var(--secondary-text);">
              ${other.university || "Stanford University"} &bull; <strong style="color: #10B981;">Online</strong>
            </span>
          </div>
        </div>

        <div class="cs-chat-header-actions">
          <button type="button" class="cs-icon-btn" onclick="window.proposeCampusCall('${other.name}')" title="Campus Safety Call">
            📞
          </button>
          <button type="button" class="cs-icon-btn" onclick="window.viewPeerDetails('${other.name}', '${other.university}')" title="Peer Student Info">
            ℹ️
          </button>
        </div>
      </div>

      <!-- 2. LISTING HEADER STRIP -->
      <div class="cs-listing-context-strip">
        <div class="cs-listing-item-info">
          <img
            src="${activeConv.itemImage || (typeof getCategoryPlaceholderSvg === 'function' ? getCategoryPlaceholderSvg('Electronics') : '')}"
            alt="${activeConv.itemTitle}"
            class="cs-listing-thumb"
          />
          <div style="min-width: 0;">
            <div class="cs-listing-meta-title">${activeConv.itemTitle}</div>
            <div class="cs-listing-negotiating-badge">${activeConv.itemStatus || "Negotiating campus exchange"}</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 14px; flex-shrink: 0;">
          <span class="cs-listing-price-tag">${priceFormatted}</span>
          <a href="${detailUrl}" class="btn btn-outline btn-sm" style="font-size: 0.8rem; padding: 6px 12px; border-radius: 8px;">
            View Item
          </a>
        </div>
      </div>

      <!-- 3. VERIFIED ENCRYPTION BANNER -->
      <div class="cs-verified-chat-banner">
        <span>🛡️</span> CAMPUS VERIFIED CHAT &bull; END-TO-END ENCRYPTED
      </div>

      <!-- 4. CHAT MESSAGES BODY -->
      <div id="cs-messages-body" class="cs-chat-body">
        ${(activeConv.messages || []).map(msg => {
          const isMe = msg.isMe === true || msg.senderId === currentUserId || msg.senderId === "usr_current";
          return `
            <div class="cs-msg-row ${isMe ? 'outgoing' : 'incoming'}">
              <div class="cs-msg-bubble">
                ${msg.text}
              </div>
              <div class="cs-msg-time">
                ${msg.timestamp || 'Just now'} ${isMe ? '✓✓' : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- 5. MESSAGE INPUT BAR -->
      <div class="cs-chat-input-bar">
        <form id="cs-chat-form" class="cs-chat-form">
          <button type="button" class="cs-attach-btn" onclick="window.triggerAttachment()" title="Attach photo or location">
            📎
          </button>
          <input
            type="text"
            id="cs-chat-text-input"
            class="cs-chat-input"
            placeholder="Type a message or propose a campus meetup..."
            autocomplete="off"
            required
          />
          <button type="submit" class="cs-send-btn">
            Send 🚀
          </button>
        </form>
      </div>
    `;

    // Scroll messages to bottom
    const body = document.getElementById("cs-messages-body");
    if (body) {
      body.scrollTop = body.scrollHeight;
    }

    // Bind Message Send Form
    const sendForm = document.getElementById("cs-chat-form");
    const sendInput = document.getElementById("cs-chat-text-input");

    if (sendForm && sendInput) {
      sendForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const text = sendInput.value.trim();
        if (!text) return;

        // Persist outgoing message
        sendChatMessage(activeConv.id, text);
        sendInput.value = "";

        // Re-render chat
        renderAll();

        // Simulate realistic peer reply after 1.5s
        setTimeout(() => {
          simulatePeerReply(activeConv.id, other.name);
        }, 1500);
      });
    }
  }

  // Simulate Realistic Campus Peer Reply
  function simulatePeerReply(convId, peerName) {
    const convs = getConversations();
    const target = convs.find(c => String(c.id) === String(convId));
    if (!target) return;

    const replies = [
      "Sounds great! I can meet you at the Student Union near the Starbucks at 3 PM today.",
      "Awesome, thanks for reaching out! Let me know if the campus library entrance works for you.",
      "Sure thing! Cash, Google Pay, or UPI works smoothly for me when we meet up.",
      "Perfect! I will bring the item along with its original packaging and cables."
    ];
    const replyText = replies[Math.floor(Math.random() * replies.length)];
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    target.messages.push({
      id: "msg_reply_" + Date.now(),
      senderId: target.otherUser ? target.otherUser.id : "usr_peer",
      text: replyText,
      timestamp: timeNow,
      isMe: false
    });
    target.lastUpdated = "Just now";
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(convs));

    if (typeof addNotification === "function") {
      addNotification("New Message", `${peerName}: "${replyText.slice(0, 45)}..."`, "messages.html?conv=" + convId, "💬");
    }

    if (typeof showToast === "function") {
      showToast(`New message from ${peerName}`, "info");
    }

    renderAll();
  }

  // Global Handlers
  window.selectConversation = function(convId) {
    activeConvId = convId;
    if (container) container.classList.add("chat-active");
    renderAll();
  };

  window.closeMobileChat = function() {
    if (container) container.classList.remove("chat-active");
  };

  window.proposeCampusCall = function(peerName) {
    if (typeof showToast === "function") {
      showToast(`Campus Safety Call request sent to ${peerName}`, "success");
    }
  };

  window.viewPeerDetails = function(peerName, university) {
    if (typeof showToast === "function") {
      showToast(`${peerName} • Verified Student at ${university}`, "info");
    }
  };

  window.triggerAttachment = function() {
    if (typeof showToast === "function") {
      showToast("File attachment: Select campus receipt, photo, or meetup point", "info");
    }
  };

  // Initial render
  renderAll();
});
