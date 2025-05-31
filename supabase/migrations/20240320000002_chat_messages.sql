-- Create chat_messages table
create table public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.chat_messages enable row level security;

-- Create policies for chat messages
create policy "Users can view their own messages"
  on public.chat_messages for select
  using (auth.uid() = sender_id);

create policy "Admins can view all messages"
  on public.chat_messages for select
  using (auth.jwt() ->> 'email' = 'admin@admin.com');

create policy "Users can create messages"
  on public.chat_messages for insert
  with check (auth.uid() = sender_id);

create policy "Admins can update message read status"
  on public.chat_messages for update
  using (auth.jwt() ->> 'email' = 'admin@admin.com');

-- Create trigger for updated_at
create trigger handle_updated_at
  before update on public.chat_messages
  for each row execute procedure public.handle_updated_at(); 