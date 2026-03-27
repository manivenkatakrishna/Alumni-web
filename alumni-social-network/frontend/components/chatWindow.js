import { escapeHtml, formatRelativeDate, getAvatarMarkup } from "../../utils/helpers.js";

export function renderChatWindow(messagesData, currentUser) {
  if (!messagesData?.activeUser) {
    return `
      <section class="chat-area">
        <div class="no-chat">
          <h3>Select a conversation</h3>
          <p>Choose an alumni connection to start chatting.</p>
        </div>
      </section>
    `;
  }

  return `
    <section class="chat-area">
      <div class="chat-header">
        ${getAvatarMarkup(messagesData.activeUser, "avatar avatar-xs")}
        <div>
          <strong>${escapeHtml(messagesData.activeUser.full_name)}</strong>
          <div class="text-muted">${escapeHtml(messagesData.activeUser.department || "Alumni")}</div>
        </div>
      </div>
      <div class="chat-messages">
        ${
          messagesData.conversation.length
            ? messagesData.conversation
                .map((message) => {
                  const own = String(message.sender_id) === String(currentUser.id);
                  return `
                    <div class="chat-message-wrap ${own ? "sent-wrap" : "received-wrap"}">
                      <div class="chat-bubble ${own ? "sent" : "received"}">${escapeHtml(message.text)}</div>
                      <div class="bubble-time">${formatRelativeDate(message.created_at)}</div>
                    </div>
                  `;
                })
                .join("")
            : `<div class="no-chat-inline">Say hello! &#128075;</div>`
        }
      </div>
      <form class="chat-input-row" data-form="send-message">
        <input type="hidden" name="receiver_id" value="${messagesData.activeUser.id}" />
        <input class="chat-input" name="text" placeholder="Type a message..." maxlength="500" required />
        <button class="chat-send" type="submit" aria-label="Send message">&#10148;</button>
      </form>
    </section>
  `;
}

