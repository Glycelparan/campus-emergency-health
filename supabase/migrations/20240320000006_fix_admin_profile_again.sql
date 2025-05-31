-- First, check if the admin profile exists
do $$
declare
  admin_exists boolean;
begin
  -- Check if admin profile exists
  select exists(
    select 1 from public.profiles 
    where id = 'f7563c6d-4841-4a9e-802c-c44ec6962c0b'
  ) into admin_exists;

  -- If admin profile doesn't exist, create it
  if not admin_exists then
    insert into public.profiles (id, full_name)
    values ('f7563c6d-4841-4a9e-802c-c44ec6962c0b', 'Campus Assistant');
  else
    -- If it exists, update the name
    update public.profiles
    set full_name = 'Campus Assistant'
    where id = 'f7563c6d-4841-4a9e-802c-c44ec6962c0b';
  end if;
end $$; 