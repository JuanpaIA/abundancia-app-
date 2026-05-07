-- TABLA DE PERFILES DE USUARIO
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null,
  birth_date date not null,
  zodiac_sign text not null,
  numerology_number integer not null,
  base_frequency integer not null,
  stripe_customer_id text,
  subscription_status text not null default 'inactive',
  plan_type text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Usuario ve solo su perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuario actualiza solo su perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Usuario inserta su perfil"
  on public.profiles for insert
  with check (auth.uid() = id);


-- TABLA DE REGISTROS DIARIOS
create table public.daily_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  date date not null default current_date,
  energy_level integer check (energy_level between 1 and 5),
  habits_completed text[] default '{}',
  morning_done boolean default false,
  afternoon_done boolean default false,
  night_done boolean default false,
  created_at timestamptz default now(),
  unique(user_id, date)
);

alter table public.daily_logs enable row level security;

create policy "Usuario gestiona sus registros"
  on public.daily_logs for all
  using (auth.uid() = user_id);


-- TABLA DE HÁBITOS
create table public.habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  name text not null,
  active boolean default true,
  created_at timestamptz default now()
);

alter table public.habits enable row level security;

create policy "Usuario gestiona sus hábitos"
  on public.habits for all
  using (auth.uid() = user_id);


-- TABLA DE INTENCIONES
create table public.intentions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  desire text not null,
  emotion text not null,
  action text not null,
  target_date date,
  lunar_phase_created text not null,
  created_at timestamptz default now()
);

alter table public.intentions enable row level security;

create policy "Usuario gestiona sus intenciones"
  on public.intentions for all
  using (auth.uid() = user_id);


-- TABLA DE RUEDA DE ABUNDANCIA
create table public.balance_wheel (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  date date not null default current_date,
  dinero integer default 5 check (dinero between 1 and 10),
  salud integer default 5 check (salud between 1 and 10),
  amor integer default 5 check (amor between 1 and 10),
  proposito integer default 5 check (proposito between 1 and 10),
  familia integer default 5 check (familia between 1 and 10),
  bienestar integer default 5 check (bienestar between 1 and 10),
  crecimiento integer default 5 check (crecimiento between 1 and 10),
  gratitud integer default 5 check (gratitud between 1 and 10),
  created_at timestamptz default now(),
  unique(user_id, date)
);

alter table public.balance_wheel enable row level security;

create policy "Usuario gestiona su rueda"
  on public.balance_wheel for all
  using (auth.uid() = user_id);


-- FUNCIÓN: crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, birth_date, zodiac_sign, numerology_number, base_frequency)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'birth_date')::date, current_date),
    coalesce(new.raw_user_meta_data->>'zodiac_sign', 'aries'),
    coalesce((new.raw_user_meta_data->>'numerology_number')::integer, 1),
    coalesce((new.raw_user_meta_data->>'base_frequency')::integer, 432)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
