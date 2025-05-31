-- Create profiles table to store additional user information
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  student_id text unique,
  phone_number text,
  emergency_contact text,
  medical_conditions text,
  allergies text,
  blood_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create emergency_incidents table to track emergency situations
create table public.emergency_incidents (
  id uuid default gen_random_uuid() primary key,
  reported_by uuid references public.profiles(id) not null,
  incident_type text not null,
  location text not null,
  description text,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null default 'active' check (status in ('active', 'resolved', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create emergency_responses table to track responses to incidents
create table public.emergency_responses (
  id uuid default gen_random_uuid() primary key,
  incident_id uuid references public.emergency_incidents(id) on delete cascade not null,
  responder_id uuid references public.profiles(id) not null,
  response_type text not null,
  notes text,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS (Row Level Security) policies
alter table public.profiles enable row level security;
alter table public.emergency_incidents enable row level security;
alter table public.emergency_responses enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Emergency incidents policies
create policy "Anyone can view emergency incidents"
  on public.emergency_incidents for select
  using (true);

create policy "Authenticated users can create emergency incidents"
  on public.emergency_incidents for insert
  with check (auth.role() = 'authenticated');

create policy "Users can update their own reported incidents"
  on public.emergency_incidents for update
  using (auth.uid() = reported_by);

-- Emergency responses policies
create policy "Anyone can view emergency responses"
  on public.emergency_responses for select
  using (true);

create policy "Authenticated users can create emergency responses"
  on public.emergency_responses for insert
  with check (auth.role() = 'authenticated');

create policy "Users can update their own responses"
  on public.emergency_responses for update
  using (auth.uid() = responder_id);

-- Create function to handle new user signups
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user signups
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
  before update on public.emergency_incidents
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
  before update on public.emergency_responses
  for each row execute procedure public.handle_updated_at(); 