import { supabase } from "../../supabase.js";

export const commentService = {
  async addComment(payload) {
    const { data, error } = await supabase.from("comments").insert(payload).select("*").single();
    if (error) {
      throw error;
    }
    return data;
  },

  async getCommentById(commentId) {
    const { data, error } = await supabase.from("comments").select("*").eq("id", commentId).maybeSingle();
    if (error) {
      throw error;
    }
    return data;
  },

  async deleteComment(commentId) {
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (error) {
      throw error;
    }
  },
};
