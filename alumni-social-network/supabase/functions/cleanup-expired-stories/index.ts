import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: expiredStories, error: fetchError } = await supabase
    .from("stories")
    .select("id, media_url")
    .lt("created_at", cutoff);

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!expiredStories?.length) {
    return new Response(JSON.stringify({ deleted: 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const paths = expiredStories
    .map((story) => {
      try {
        const url = new URL(story.media_url);
        const marker = "/storage/v1/object/public/stories/";
        const index = url.pathname.indexOf(marker);
        return index >= 0
          ? decodeURIComponent(url.pathname.slice(index + marker.length))
          : null;
      } catch {
        return null;
      }
    })
    .filter((value): value is string => Boolean(value));

  if (paths.length) {
    const { error: storageError } = await supabase.storage.from("stories").remove(paths);
    if (storageError) {
      return new Response(JSON.stringify({ error: storageError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const ids = expiredStories.map((story) => story.id);

  const { error: deleteError } = await supabase
    .from("stories")
    .delete()
    .in("id", ids);

  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ deleted: ids.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
