-- Create dream_likes table
create table if not exists public.dream_likes (
    id uuid default gen_random_uuid() primary key,
    dream_id uuid references public.dream_images(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    created_at timestamptz default now(),
    unique(dream_id, user_id)
);

-- Enable RLS
alter table public.dream_likes enable row level security;

-- Policies for dream_likes
create policy "Users can view all likes"
    on public.dream_likes for select
    using (true);

create policy "Users can like dreams"
    on public.dream_likes for insert
    with check (auth.uid() = user_id);

create policy "Users can unlike their own likes"
    on public.dream_likes for delete
    using (auth.uid() = user_id);

-- Optional: Add a function to get like counts efficiently if needed, 
-- but for now we can select count in the frontend or use a view.
-- A view might be better for performance if we have many likes.
create or replace view public.v_dream_likes_count as
select 
    dream_id, 
    count(*) as like_count 
from 
    public.dream_likes 
group by 
    dream_id;
