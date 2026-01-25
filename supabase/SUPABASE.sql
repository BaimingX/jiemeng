-- Oneiro AI Internal Database Schema

-- 1. Conversation Table (One per day per user)
create table public.dream_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  date_id text not null, -- Format: 'YYYY-MM-DD'
  summary text,
  image_url text,
  conversation_history jsonb, -- Stores the full conversation array
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Ensure one conversation per day per user
  unique(user_id, date_id)
);

-- RLS for Conversations
alter table public.dream_conversations enable row level security;

create policy "Users can view their own conversations"
  on public.dream_conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own conversations"
  on public.dream_conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own conversations"
  on public.dream_conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own conversations"
  on public.dream_conversations for delete
  using (auth.uid() = user_id);


-- 2. Messages Table
create table public.dream_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  conversation_date_id text not null, -- Links to dream_conversations.date_id logic
  -- We could link by uuid, but since local checks by date_id, storing it is useful.
  -- Ideally, link to dream_conversations(id). But local app knows date_id easier.
  -- Let's stick to simple referencing.
  
  client_message_id text, -- The ID generated on client side
  sender text check (sender in ('user', 'ai', 'system')),
  message_type text check (message_type in ('text', 'image', 'loading')),
  text_content text,
  image_url text,
  timestamp timestamptz default now()
);

-- RLS for Messages
alter table public.dream_messages enable row level security;

create policy "Users can view their own messages"
  on public.dream_messages for select
  using (auth.uid() = user_id);

create policy "Users can insert their own messages"
  on public.dream_messages for insert
  with check (auth.uid() = user_id);
  
-- 3. Feedback Table
create table public.dream_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  conversation_date_id text, -- Optional: which day/dream this feedback is about
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now()
);

-- RLS for Feedback
alter table public.dream_feedback enable row level security;

create policy "Users can insert their own feedback"
  on public.dream_feedback for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own feedback"
  on public.dream_feedback for select
  using (auth.uid() = user_id);

-- 4. User Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  display_name text,
  avatar_url text,
  credits_balance integer default 0,
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS for Profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
