# Alumni Social Network

A production-structured alumni social network built with vanilla ES modules and Supabase.

## What is included

- Authentication with `supabase.auth.signInWithPassword()` and `supabase.auth.signUp()`
- Alumni feed with posts, likes, comments, and delete controls
- Stories with Supabase Storage uploads
- Alumni directory with search
- Realtime messaging UI backed by Supabase tables
- Editable profile page with image upload
- Hash-routed SPA that works on static hosting
- Modular frontend, controller, service, and route structure

## Project root

- `index.html`
- `style.css`
- `app.js`
- `supabase.js`
- `frontend/`
- `backend/`
- `utils/`
- `supabase/schema.sql`

## Setup

1. Create a Supabase project.
2. Run the SQL in `supabase/schema.sql`.
3. Create or confirm public buckets named `posts`, `stories`, and `avtars`.
4. The app is already configured for project `jzqgoxgcivldhrqneilh`.
5. If you want to override config manually, provide:
   `window.SUPABASE_CONFIG = { url, anonKey, profileBucket: "avtars", postsBucket: "posts", storiesBucket: "stories" }`
6. Serve the `alumni-social-network/` folder with any static server.

## Notes

- The app expects the tables `users`, `posts`, `comments`, `likes`, `messages`, and `stories`.
- Realtime updates depend on the publication statements in `supabase/schema.sql`.
- Storage bucket names are fixed to `avtars`, `posts`, and `stories` unless explicitly overridden through `window.SUPABASE_CONFIG`.

