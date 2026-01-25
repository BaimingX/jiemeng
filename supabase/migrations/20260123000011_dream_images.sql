-- Create dream_images table
create table if not exists public.dream_images (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    conversation_id text not null, -- Stores the yyyy-mm-dd format
    temp_url text,
    permanent_url text,
    is_public boolean default false,
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.dream_images enable row level security;

-- Policies
create policy "Users can view their own images"
    on public.dream_images for select
    using (auth.uid() = user_id);

create policy "Users can insert their own images"
    on public.dream_images for insert
    with check (auth.uid() = user_id);

create policy "Images marked public are viewable by everyone"
    on public.dream_images for select
    using (is_public = true);

create policy "Users can update their own images"
    on public.dream_images for update
    using (auth.uid() = user_id);

-- Storage Bucket for Permanent Images
insert into storage.buckets (id, name, public)
values ('permanent_dream_images', 'permanent_dream_images', true)
on conflict (id) do nothing;

-- Storage Policies
create policy "Start images are publicly accessible"
    on storage.objects for select
    using ( bucket_id = 'permanent_dream_images' );

create policy "Users can upload their own images"
    on storage.objects for insert
    with check ( bucket_id = 'permanent_dream_images' and auth.uid() = owner );

create policy "Users can list their own images"
    on storage.objects for select
    using ( bucket_id = 'permanent_dream_images' and auth.uid() = owner );
