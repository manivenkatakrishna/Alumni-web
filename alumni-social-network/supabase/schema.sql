create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  department text not null,
  graduation_year int not null,
  profile_image text default '',
  bio text default '',
  location text default '',
  company text default ''
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  text text default '',
  image_url text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  unique (post_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  media_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_posts_user_created on public.posts (user_id, created_at desc);
create index if not exists idx_comments_post_created on public.comments (post_id, created_at asc);
create index if not exists idx_messages_sender_receiver_created on public.messages (sender_id, receiver_id, created_at asc);
create index if not exists idx_stories_user_created on public.stories (user_id, created_at desc);

alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.messages enable row level security;
alter table public.stories enable row level security;

drop policy if exists "users are viewable by authenticated users" on public.users;
create policy "users are viewable by authenticated users" on public.users
for select to authenticated using (true);

drop policy if exists "users can insert own profile" on public.users;
create policy "users can insert own profile" on public.users
for insert to authenticated with check (auth.uid() = id);

drop policy if exists "users can update own profile" on public.users;
create policy "users can update own profile" on public.users
for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "posts are viewable by authenticated users" on public.posts;
create policy "posts are viewable by authenticated users" on public.posts
for select to authenticated using (true);

drop policy if exists "users can create own posts" on public.posts;
create policy "users can create own posts" on public.posts
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "users can delete own posts" on public.posts;
create policy "users can delete own posts" on public.posts
for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "comments are viewable by authenticated users" on public.comments;
create policy "comments are viewable by authenticated users" on public.comments
for select to authenticated using (true);

drop policy if exists "users can create own comments" on public.comments;
create policy "users can create own comments" on public.comments
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "users can delete own comments" on public.comments;
create policy "users can delete own comments" on public.comments
for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "likes are viewable by authenticated users" on public.likes;
create policy "likes are viewable by authenticated users" on public.likes
for select to authenticated using (true);

drop policy if exists "users can create own likes" on public.likes;
create policy "users can create own likes" on public.likes
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "users can delete own likes" on public.likes;
create policy "users can delete own likes" on public.likes
for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "messages are visible to participants" on public.messages;
create policy "messages are visible to participants" on public.messages
for select to authenticated using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "users can send messages" on public.messages;
create policy "users can send messages" on public.messages
for insert to authenticated with check (auth.uid() = sender_id);

drop policy if exists "stories are viewable by authenticated users" on public.stories;
create policy "stories are viewable by authenticated users" on public.stories
for select to authenticated using (true);

drop policy if exists "users can create own stories" on public.stories;
create policy "users can create own stories" on public.stories
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "users can delete own stories" on public.stories;
create policy "users can delete own stories" on public.stories
for delete to authenticated using (auth.uid() = user_id);

alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.likes;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.stories;
