-- Insert admin profile if it doesn't exist
do $$
declare
  admin_user_id uuid;
begin
  -- Get the admin user's ID
  select id into admin_user_id
  from auth.users
  where email = 'admin@admin.com';

  -- If admin user exists and doesn't have a profile, create one
  if admin_user_id is not null then
    insert into public.profiles (id, full_name)
    select admin_user_id, 'Admin'
    where not exists (
      select 1 from public.profiles where id = admin_user_id
    );
  end if;
end $$; 