-- Ensure admin role exists
do $$ 
begin
  if not exists (select from pg_roles where rolname = 'admin') then
    create role admin;
  end if;
end
$$;

-- Revoke all existing privileges
revoke all privileges on all tables in schema public from admin;
revoke all privileges on all sequences in schema public from admin;
revoke usage on schema public from admin;

-- Grant admin privileges
grant usage on schema public to admin;
grant all privileges on all tables in schema public to admin;
grant all privileges on all sequences in schema public to admin;

-- Drop existing policies if they exist
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;
drop policy if exists "Admins can delete profiles" on public.profiles;
drop policy if exists "Admins can manage all emergency incidents" on public.emergency_incidents;
drop policy if exists "Admins can manage all emergency responses" on public.emergency_responses;

-- Create admin policies
create policy "Admins can view all profiles"
  on public.profiles for select
  using (auth.jwt() ->> 'email' = 'admin@admin.com');

create policy "Admins can update all profiles"
  on public.profiles for update
  using (auth.jwt() ->> 'email' = 'admin@admin.com');

create policy "Admins can delete profiles"
  on public.profiles for delete
  using (auth.jwt() ->> 'email' = 'admin@admin.com');

create policy "Admins can manage all emergency incidents"
  on public.emergency_incidents for all
  using (auth.jwt() ->> 'email' = 'admin@admin.com');

create policy "Admins can manage all emergency responses"
  on public.emergency_responses for all
  using (auth.jwt() ->> 'email' = 'admin@admin.com');

-- Create admin user (this will be executed by Supabase Auth)
-- Note: The actual user creation should be done through the Supabase dashboard or API
-- This is just a comment to document the credentials:
-- Email: admin@admin.com (or just 'admin' in the login form)
-- Password: admin 