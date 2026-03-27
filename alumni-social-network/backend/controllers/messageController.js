import { supabase } from "../../supabase.js";
import { authService } from "../services/authService.js";
import { messageService } from "../services/messageService.js";
import { validateRequired } from "../../utils/validation.js";

function buildPreviewMap(messages, currentUserId) {
  const previews = {};

  messages.forEach((message) => {
    const otherUserId = message.sender_id === currentUserId ? message.receiver_id : message.sender_id;
    const previous = previews[otherUserId];
    if (!previous || new Date(message.created_at) > new Date(previous.created_at)) {
      previews[otherUserId] = {
        text: message.text,
        created_at: message.created_at,
      };
    }
  });

  return previews;
}

export const messageController = {
  async loadMessagesPage(currentUserId, selectedUserId = null) {
    const [messages, users] = await Promise.all([
      messageService.getAllMessagesForUser(currentUserId),
      authService.getUsers(""),
    ]);

    const userMap = Object.fromEntries(users.map((user) => [user.id, user]));
    const previewMap = buildPreviewMap(messages, currentUserId);
    const activeUserId = selectedUserId || users.find((user) => String(user.id) !== String(currentUserId))?.id || null;
    const conversation = activeUserId ? await messageService.getConversation(currentUserId, activeUserId) : [];

    return {
      users,
      previews: Object.fromEntries(
        Object.entries(previewMap).map(([userId, preview]) => [userId, preview.text]),
      ),
      activeUser: activeUserId ? userMap[activeUserId] : null,
      conversation,
    };
  },

  async sendMessage(form, currentUserId) {
    const formData = new FormData(form);
    const receiver_id = formData.get("receiver_id");
    const text = formData.get("text");

    validateRequired(receiver_id, "Receiver");
    validateRequired(text, "Message");

    await messageService.sendMessage({ sender_id: currentUserId, receiver_id, text });
  },

  subscribeToMessages(userId, onRefresh) {
    return supabase
      .channel(`messages-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, onRefresh)
      .subscribe();
  },
};
