-- First, check if the admin profile exists
do $$
declare
  admin_exists boolean;
begin
  -- Check if admin profile exists
  select exists(
    select 1 from public.profiles 
    where id = '8a7503f2-400b-4bf0-89a3-77f1157dd8c0'
  ) into admin_exists;

  -- If admin profile doesn't exist, create it
  if not admin_exists then
    insert into public.profiles (id, full_name)
    values ('8a7503f2-400b-4bf0-89a3-77f1157dd8c0', 'Campus Assistant');
  else
    -- If it exists, update the name
    update public.profiles
    set full_name = 'Campus Assistant'
    where id = '8a7503f2-400b-4bf0-89a3-77f1157dd8c0';
  end if;
end $$; 