import { renderChatWindow } from "../components/chatWindow.js";
import { escapeHtml, getAvatarMarkup } from "../../utils/helpers.js";

function renderUserList(messagesData) {
  return messagesData.users
    .filter((user) => user.id !== messagesData.currentUserId)
    .map((user) => {
      const preview = messagesData.previews[user.id] || "Start conversation";
      const active = String(user.id) === String(messagesData.activeUser?.id);
      return `
        <button class="user-list-item ${active ? "active" : ""}" data-action="open-message-thread" data-user-id="${user.id}" type="button">
          ${getAvatarMarkup(user, "avatar avatar-xs")}
          <div>
            <div class="name">${escapeHtml(user.full_name)}</div>
            <div class="preview">${escapeHtml(preview)}</div>
          </div>
        </button>
      `;
    })
    .join("");
}

export function renderMessagesPage(messagesData, currentUser) {
  if (!messagesData) {
    return "";
  }

  return `
    <section class="messages-page-modern">
      <div class="card messages-layout">
        <aside class="msg-sidebar">
          <div class="msg-sidebar-header">Messages</div>
          <div id="user-list">${renderUserList({ ...messagesData, currentUserId: currentUser.id })}</div>
        </aside>
        ${renderChatWindow(messagesData, currentUser)}
      </div>
    </section>
  `;
}
