-- Ensure admin profile exists
do $$
declare
  admin_user_id uuid;
begin
  -- Get the admin user's ID from auth.users
  select id into admin_user_id
  from auth.users
  where email = 'admin@admin.com';

  -- If admin user exists, ensure they have a profile
  if admin_user_id is not null then
    -- Insert admin profile if it doesn't exist
    insert into public.profiles (id, full_name)
    values (admin_user_id, 'Campus Assistant')
    on conflict (id) do update
    set full_name = 'Campus Assistant';
  end if;
end $$; 