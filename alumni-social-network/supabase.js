import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FALLBACK_SUPABASE_URL = "https://jzqgoxgcivldhrqneilh.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6cWdveGdjaXZsZGhycW5laWxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNjQ0NzIsImV4cCI6MjA4OTc0MDQ3Mn0.oXoMvkytdicP5WMrVUjuncS0xmX9S-iYn9K9urCMW7w";

const runtimeConfig = window.SUPABASE_CONFIG || {};

export const SUPABASE_URL = runtimeConfig.url || FALLBACK_SUPABASE_URL;
export const SUPABASE_ANON_KEY = runtimeConfig.anonKey || FALLBACK_SUPABASE_ANON_KEY;

export const STORAGE_BUCKETS = {
  profiles: runtimeConfig.profileBucket || "avtars",
  posts: runtimeConfig.postsBucket || "posts",
  stories: runtimeConfig.storiesBucket || "stories",
};

export function getStorageBucket(folder) {
  if (folder === "profiles") {
    return STORAGE_BUCKETS.profiles;
  }
  if (folder === "stories") {
    return STORAGE_BUCKETS.stories;
  }
  return STORAGE_BUCKETS.posts;
}

export function isSupabaseConfigured() {
  return !SUPABASE_URL.includes("YOUR_PROJECT") && !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

window.__appSupabase = supabase;
