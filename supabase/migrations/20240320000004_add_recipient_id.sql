-- Add recipient_id column to chat_messages table
alter table public.chat_messages
add column recipient_id uuid references public.profiles(id);

-- Update RLS policies to allow viewing messages where user is recipient
create policy "Users can view messages where they are recipient"
  on public.chat_messages for select
  using (auth.uid() = recipient_id);

-- Update admin policy to allow viewing all messages
drop policy if exists "Admins can view all messages" on public.chat_messages;
create policy "Admins can view all messages"
  on public.chat_messages for select
  using (auth.jwt() ->> 'email' = 'admin@admin.com');

-- Update insert policy to allow admins to create messages with recipient
drop policy if exists "Users can create messages" on public.chat_messages;
create policy "Users can create messages"
  on public.chat_messages for insert
  with check (
    auth.uid() = sender_id or
    (auth.jwt() ->> 'email' = 'admin@admin.com' and recipient_id is not null)
  ); 