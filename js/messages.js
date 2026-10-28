/* ==========================================================================
   CampusShare - Messages & Inter-Student Chat Controller
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function() {
  const convListContainer = document.getElementById("conversations-list");
  const chatThreadContainer = document.getElementById("chat-thread-container");
  if (!convListContainer || !chatThreadContainer) return;

  let conversations = getMessages();
  
  // Read target conversation ID from URL query param if present
  const urlParams = new URLSearchParams(window.location.search);
  let activeConvId = urlParams.get("conv") || (conversations.length > 0 ? conversations[0].id : null);

  renderMessagesView(activeConvId);
});

function renderMessagesView(activeConvId) {
  const convListContainer = document.getElementById("conversations-list");
  const chatThreadContainer = document.getElementById("chat-thread-container");

  const conversations = getMessages();

  if (conversations.length === 0) {
    convListContainer.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--secondary-text);">No conversations yet</div>`;
    chatThreadContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; color: var(--secondary-text);">
        <div style="font-size: 3rem; margin-bottom: 12px;">💬</div>
        <h3>No active messages</h3>
        <p>When you contact sellers about items, your conversations will appear here.</p>
      </div>
    `;
    return;
  }

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  // Render Conversation List
  convListContainer.innerHTML = conversations.map(conv => {
    const isActive = conv.id === activeConv.id;
    return `
      <div class="conv-item ${isActive ? 'active' : ''}" onclick="switchConversation('${conv.id}')" style="display: flex; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--border); cursor: pointer; background: ${isActive ? 'var(--blue-light)' : 'var(--white)'}; transition: var(--transition-fast);">
        <img src="${conv.otherUser.avatar}" alt="${conv.otherUser.name}" class="avatar avatar-md" />
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <strong style="font-size: 0.95rem; color: var(--navy);">${conv.otherUser.name}</strong>
            <span style="font-size: 0.75rem; color: var(--secondary-text);">${conv.lastUpdated}</span>
          </div>
          <div style="font-size: 0.85rem; color: var(--purple); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${conv.itemTitle}
          </div>
          <div style="font-size: 0.8rem; color: var(--secondary-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].text : ''}
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Render Active Chat Thread
  renderChatThread(activeConv);
}

function renderChatThread(conv) {
  const chatThreadContainer = document.getElementById("chat-thread-container");
  const currentUser = getCurrentUser();

  chatThreadContainer.innerHTML = `
    <!-- Chat Header -->
    <div style="padding: 16px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: var(--white);">
      <div style="display: flex; align-items: center; gap: 12px;">
        <img src="${conv.otherUser.avatar}" alt="${conv.otherUser.name}" class="avatar avatar-md" />
        <div>
          <h4 style="margin: 0; color: var(--navy); font-size: 1.05rem;">${conv.otherUser.name}</h4>
          <span style="font-size: 0.8rem; color: var(--success); font-weight: 500;">● Online on Campus</span>
        </div>
      </div>

      <!-- Item Context Strip -->
      <a href="item-details.html?id=${conv.itemId}" style="display: flex; align-items: center; gap: 10px; padding: 6px 12px; background: var(--background); border-radius: var(--radius-md); border: 1px solid var(--border); text-decoration: none;">
        <img src="${conv.itemImage}" alt="${conv.itemTitle}" style="width: 36px; height: 36px; object-fit: cover; border-radius: 4px;" />
        <div>
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--navy); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${conv.itemTitle}</div>
          <div style="font-size: 0.8rem; color: var(--blue); font-weight: 700;">${conv.price !== undefined && conv.price !== null ? (parseFloat(conv.price) > 0 ? '$' + parseFloat(conv.price).toFixed(2) : 'FREE') : ''}</div>
        </div>
      </a>
    </div>

    <!-- Chat Messages Scroll Area -->
    <div id="messages-body" style="flex: 1; padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: #FAFBFD; max-height: 440px;">
      ${conv.messages.map(msg => {
        const isMe = msg.senderId === "usr_current" || (currentUser && msg.senderId === currentUser.id);
        return `
          <div style="display: flex; flex-direction: column; align-items: ${isMe ? 'flex-end' : 'flex-start'};">
            <div style="max-width: 70%; padding: 12px 16px; border-radius: 16px; font-size: 0.95rem; line-height: 1.4; ${isMe ? 'background: var(--blue); color: var(--white); border-bottom-right-radius: 2px;' : 'background: var(--white); color: var(--text); border: 1px solid var(--border); border-bottom-left-radius: 2px; box-shadow: var(--shadow-sm);'}">
              ${msg.text}
            </div>
            <span style="font-size: 0.75rem; color: var(--secondary-text); margin-top: 4px; padding: 0 4px;">${msg.timestamp}</span>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Send Message Input Bar -->
    <div style="padding: 16px 24px; background: var(--white); border-top: 1px solid var(--border);">
      <form id="send-chat-form" style="display: flex; gap: 12px;">
        <input type="text" id="chat-input-text" class="form-control" placeholder="Type your message to ${conv.otherUser.name}..." autocomplete="off" />
        <button type="submit" class="btn btn-primary" style="padding: 0 24px;">Send 🚀</button>
      </form>
    </div>
  `;

  // Auto scroll to bottom
  const msgBody = document.getElementById("messages-body");
  if (msgBody) msgBody.scrollTop = msgBody.scrollHeight;

  // Bind submit event
  const sendForm = document.getElementById("send-chat-form");
  const sendInput = document.getElementById("chat-input-text");

  if (sendForm && sendInput) {
    sendForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const text = sendInput.value.trim();
      if (!text) return;

      // Save message
      sendMessage(conv.id, text);
      sendInput.value = "";

      // Re-render
      renderMessagesView(conv.id);

      // Simulate seller automated reply after 2 seconds
      setTimeout(() => {
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const autoReplies = [
          "Sounds great! I can meet you at the Student Union near Starbucks at 3 PM today.",
          "Awesome, thanks for reaching out! Let me know if that campus location works for you.",
          "Sure thing! Cash or Venmo works fine for me when we meet up."
        ];
        const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
        
        const conversations = getMessages();
        const targetConv = conversations.find(c => c.id === conv.id);
        if (targetConv) {
          targetConv.messages.push({
            senderId: conv.otherUser.id,
            text: randomReply,
            timestamp: timeNow
          });
          targetConv.lastUpdated = "Just now";
          localStorage.setItem("campus_share_messages", JSON.stringify(conversations));
          renderMessagesView(conv.id);
          showToast(`New message from ${conv.otherUser.name}`, "info");
        }
      }, 2000);
    });
  }
}

window.switchConversation = function(convId) {
  renderMessagesView(convId);
};
