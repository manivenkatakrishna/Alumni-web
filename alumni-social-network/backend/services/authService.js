import { supabase } from "../../supabase.js";

export const authService = {
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw error;
    }
    return data.session;
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
    return data;
  },

  async signup({ email, password, full_name, department, graduation_year, bio, location, company, profile_image = "" }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          department,
          graduation_year,
          bio: bio || "",
          location: location || "",
          company: company || "",
          profile_image,
        },
      },
    });

    if (error) {
      throw error;
    }

    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  },

  async createUserProfile(profile) {
    const { data, error } = await supabase.from("users").upsert(profile).select("*").single();
    if (error) {
      throw error;
    }
    return data;
  },

  async getUserProfile(userId) {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle();
    if (error) {
      throw error;
    }
    return data;
  },

  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select("*").single();
    if (error) {
      throw error;
    }
    return data;
  },

  async getUsers(search = "") {
    let query = supabase.from("users").select("*").order("full_name", { ascending: true });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,department.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }
    return data || [];
  },
};
