import { supabase } from "../../supabase.js";

export const postService = {
  async getFeed() {
    const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(50);
    if (error) {
      throw error;
    }
    return data || [];
  },

  async getPostById(postId) {
    const { data, error } = await supabase.from("posts").select("*").eq("id", postId).maybeSingle();
    if (error) {
      throw error;
    }
    return data;
  },

  async getStories() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("stories")
      .select("*")
      .gt("created_at", cutoff)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }
    return data || [];
  },

  async createPost(payload) {
    const { data, error } = await supabase.from("posts").insert(payload).select("*").single();
    if (error) {
      throw error;
    }
    return data;
  },

  async deletePost(postId) {
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      throw error;
    }
  },

  async getLikes(postIds) {
    if (!postIds.length) {
      return [];
    }
    const { data, error } = await supabase.from("likes").select("*").in("post_id", postIds);
    if (error) {
      throw error;
    }
    return data || [];
  },

  async getComments(postIds) {
    if (!postIds.length) {
      return [];
    }
    const { data, error } = await supabase.from("comments").select("*").in("post_id", postIds).order("created_at", { ascending: true });
    if (error) {
      throw error;
    }
    return data || [];
  },

  async toggleLike(postId, userId) {
    const { data: existing, error: selectError } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();

    if (selectError) {
      throw selectError;
    }

    if (existing?.id) {
      const { error } = await supabase.from("likes").delete().eq("id", existing.id);
      if (error) {
        throw error;
      }
      return { liked: false };
    }

    const { error } = await supabase.from("likes").insert({ post_id: postId, user_id: userId });
    if (error) {
      throw error;
    }
    return { liked: true };
  },

  async createStory(payload) {
    const { data, error } = await supabase.from("stories").insert(payload).select("*").single();
    if (error) {
      throw error;
    }
    return data;
  },
};
