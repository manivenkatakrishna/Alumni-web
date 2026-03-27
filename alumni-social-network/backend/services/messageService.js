import { supabase } from "../../supabase.js";

export const messageService = {
  async getAllMessagesForUser(userId) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }
    return data || [];
  },

  async getConversation(userId, otherUserId) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }
    return data || [];
  },

  async sendMessage(payload) {
    const { data, error } = await supabase.from("messages").insert(payload).select("*").single();
    if (error) {
      throw error;
    }
    return data;
  },
};
