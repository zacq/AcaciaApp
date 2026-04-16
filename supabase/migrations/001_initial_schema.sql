-- ============================================================
-- AcaciaVeld RanchOS — Initial Schema Migration
-- Run this in the Supabase SQL Editor (once, top to bottom)
-- ============================================================

-- ─── EXTENSIONS ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  full_name     text,
  email         text,
  role          text not null default 'staff'
                  check (role in ('super_admin','admin','manager','staff','vet')),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── BREEDS ──────────────────────────────────────────────────
create table if not exists public.breeds (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null unique,
  species       text not null default 'sheep',
  notes         text,
  created_at    timestamptz not null default now()
);

-- ─── ANIMAL GROUPS ────────────────────────────────────────────
create table if not exists public.animal_groups (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  purpose       text,
  location      text,
  created_at    timestamptz not null default now()
);

-- ─── ANIMALS ──────────────────────────────────────────────────
create table if not exists public.animals (
  id                    uuid primary key default uuid_generate_v4(),

  -- Identification
  tag_number            text not null unique,
  visual_id             text,
  eid                   text,               -- Electronic ID / RFID
  name                  text,
  pedigree_id           text,               -- Registry / stud book ID
  registration_number   text,
  scrapie_tag           text,

  -- Classification
  species               text not null default 'sheep',
  breed                 text not null,
  sex                   text not null check (sex in ('male','female')),
  breeding_class        text check (breeding_class in ('Fullblood','Purebred','Commercial')),
  born_as               text check (born_as in ('single','twin','triplet','quad')),
  color_markings        text,
  color_type            text,
  breed_percentage      numeric(5,2),

  -- Dates
  birth_date            date not null,
  acquisition_date      date,

  -- Parentage (linked by ID when possible, text fallback otherwise)
  sire_id               uuid references public.animals(id) on delete set null,
  dam_id                uuid references public.animals(id) on delete set null,
  dam_sire              text,               -- text fallback: unregistered dam's sire
  sire_sire             text,               -- text fallback: unregistered sire's sire
  adopted_dam           text,
  breeder_name          text,
  source_country        text,
  import_batch          text,

  -- Status
  status                text not null default 'active'
                          check (status in ('active','sold','dead','culled','archived')),
  breeding_status       text check (breeding_status in ('open','exposed','pregnant','bred','retired')),
  health_status         text not null default 'healthy'
                          check (health_status in ('healthy','under_treatment','monitor','critical')),
  cull                  boolean not null default false,

  -- Physical — cached latest values (always write to animal_weights too)
  weight_kg             numeric(6,2),
  body_condition_score  numeric(3,1),
  withdrawal_status     boolean not null default false,
  withdrawal_end_date   date,

  -- Group
  current_group_id      uuid references public.animal_groups(id) on delete set null,

  notes                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  archived_at           timestamptz
);

-- Keep updated_at current automatically
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger animals_updated_at
  before update on public.animals
  for each row execute procedure public.set_updated_at();

-- ─── ANIMAL IMAGES ────────────────────────────────────────────
create table if not exists public.animal_images (
  id            uuid primary key default uuid_generate_v4(),
  animal_id     uuid not null references public.animals(id) on delete cascade,
  file_url      text not null,
  file_path     text not null,
  slot          text not null check (slot in ('front','side','rear')),
  is_primary    boolean not null default false,
  caption       text,
  uploaded_by   uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  unique (animal_id, slot)
);

-- ─── ANIMAL WEIGHTS ────────────────────────────────────────────
create table if not exists public.animal_weights (
  id            uuid primary key default uuid_generate_v4(),
  animal_id     uuid not null references public.animals(id) on delete cascade,
  weight_kg     numeric(6,2) not null,
  recorded_at   timestamptz not null default now(),
  age_days      integer,
  condition_score numeric(3,1),
  recorded_by   uuid references auth.users(id) on delete set null,
  notes         text,
  created_at    timestamptz not null default now()
);

-- ─── ANIMAL REGISTRATION DETAILS ──────────────────────────────
create table if not exists public.animal_registration_details (
  id                  uuid primary key default uuid_generate_v4(),
  animal_id           uuid not null unique references public.animals(id) on delete cascade,
  registry_name       text,
  registration_date   date,
  certificate_number  text,
  inspector_name      text,
  breed_society       text,
  notes               text,
  created_at          timestamptz not null default now()
);

-- ─── PEDIGREE CACHE ────────────────────────────────────────────
-- Stores pre-computed ancestor paths for fast pedigree rendering
create table if not exists public.pedigree_cache (
  id            uuid primary key default uuid_generate_v4(),
  animal_id     uuid not null references public.animals(id) on delete cascade,
  generation    integer not null,           -- 1=parents, 2=grandparents, …5
  position      text not null,              -- e.g. 'sire', 'dam', 'sire_sire', etc.
  ancestor_id   uuid references public.animals(id) on delete set null,
  ancestor_tag  text,                       -- snapshot of tag at cache time
  ancestor_name text,
  updated_at    timestamptz not null default now(),
  unique (animal_id, generation, position)
);

-- ─── ANIMAL CERTIFICATES ──────────────────────────────────────
create table if not exists public.animal_certificates (
  id              uuid primary key default uuid_generate_v4(),
  animal_id       uuid not null references public.animals(id) on delete cascade,
  certificate_type text not null,           -- 'pedigree', 'health', 'movement', etc.
  issued_date     date not null default current_date,
  issued_by       uuid references auth.users(id) on delete set null,
  file_url        text,
  file_path       text,
  notes           text,
  created_at      timestamptz not null default now()
);

-- ─── TREATMENTS ────────────────────────────────────────────────
create table if not exists public.treatments (
  id                  uuid primary key default uuid_generate_v4(),
  animal_id           uuid not null references public.animals(id) on delete cascade,
  medicine_id         uuid,                 -- FK added after medicines table
  medicine_name       text,                 -- denormalized for display
  dosage              text,
  treatment_date      date not null,
  withdrawal_days     integer,
  withdrawal_end_date date,
  administered_by     uuid references auth.users(id) on delete set null,
  notes               text,
  created_at          timestamptz not null default now()
);

-- ─── HEALTH EVENTS ─────────────────────────────────────────────
create table if not exists public.health_events (
  id            uuid primary key default uuid_generate_v4(),
  animal_id     uuid not null references public.animals(id) on delete cascade,
  event_type    text not null,              -- 'illness','injury','vaccination','checkup'
  diagnosis     text,
  severity      text check (severity in ('low','medium','high','critical')),
  event_date    date not null,
  resolved_date date,
  vet_name      text,
  notes         text,
  created_at    timestamptz not null default now()
);

-- ─── MEDICINES ─────────────────────────────────────────────────
create table if not exists public.medicines (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  active_ingredient   text,
  category            text,
  unit                text,
  withdrawal_days     integer not null default 0,
  stock_quantity      numeric(8,2),
  reorder_level       numeric(8,2),
  expiry_date         date,
  notes               text,
  created_at          timestamptz not null default now()
);

-- back-fill FK on treatments
alter table public.treatments
  add column if not exists medicine_id_fk uuid references public.medicines(id) on delete set null;

-- ─── BREEDING RECORDS ──────────────────────────────────────────
create table if not exists public.breeding_records (
  id              uuid primary key default uuid_generate_v4(),
  dam_id          uuid not null references public.animals(id) on delete cascade,
  sire_id         uuid references public.animals(id) on delete set null,
  mating_date     date not null,
  method          text check (method in ('natural','AI','ET')),
  expected_birth  date,
  outcome         text check (outcome in ('pending','confirmed_pregnant','not_pregnant','aborted','lambed')),
  notes           text,
  created_at      timestamptz not null default now()
);

-- ─── PREGNANCY SCANS ───────────────────────────────────────────
create table if not exists public.pregnancy_scans (
  id              uuid primary key default uuid_generate_v4(),
  animal_id       uuid not null references public.animals(id) on delete cascade,
  scan_date       date not null,
  result          text check (result in ('empty','single','twin','triplet','quad','unknown')),
  scanner_name    text,
  notes           text,
  created_at      timestamptz not null default now()
);

-- ─── LAMBING RECORDS ───────────────────────────────────────────
create table if not exists public.lambing_records (
  id              uuid primary key default uuid_generate_v4(),
  dam_id          uuid not null references public.animals(id) on delete cascade,
  sire_id         uuid references public.animals(id) on delete set null,
  lambing_date    date not null,
  num_born        integer not null default 1,
  num_alive       integer not null default 1,
  difficulty      text check (difficulty in ('easy','assisted','difficult','caesarean')),
  notes           text,
  created_at      timestamptz not null default now()
);

-- ─── MOVEMENTS ─────────────────────────────────────────────────
create table if not exists public.movements (
  id              uuid primary key default uuid_generate_v4(),
  animal_id       uuid not null references public.animals(id) on delete cascade,
  movement_type   text not null check (movement_type in ('in','out','transfer','sale','purchase','death','cull')),
  from_location   text,
  to_location     text,
  movement_date   date not null,
  transport_by    text,
  permit_number   text,
  notes           text,
  created_at      timestamptz not null default now()
);

-- ─── WEANING RECORDS ────────────────────────────────────────────
create table if not exists public.weaning_records (
  id              uuid primary key default uuid_generate_v4(),
  animal_id       uuid not null references public.animals(id) on delete cascade,
  weaning_date    date not null,
  weaning_weight  numeric(6,2),
  dam_id          uuid references public.animals(id) on delete set null,
  notes           text,
  created_at      timestamptz not null default now()
);

-- ─── NOTES ─────────────────────────────────────────────────────
create table if not exists public.notes (
  id            uuid primary key default uuid_generate_v4(),
  title         text,
  content       text not null,
  reminder_at   timestamptz,
  is_pinned     boolean not null default false,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- ─── CONTACTS ──────────────────────────────────────────────────
create table if not exists public.contacts (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  role          text,                       -- 'vet', 'buyer', 'supplier', etc.
  phone         text,
  email         text,
  notes         text,
  created_at    timestamptz not null default now()
);

-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════
-- Enable RLS on all tables
alter table public.profiles               enable row level security;
alter table public.breeds                 enable row level security;
alter table public.animal_groups          enable row level security;
alter table public.animals                enable row level security;
alter table public.animal_images          enable row level security;
alter table public.animal_weights         enable row level security;
alter table public.animal_registration_details enable row level security;
alter table public.pedigree_cache         enable row level security;
alter table public.animal_certificates    enable row level security;
alter table public.treatments             enable row level security;
alter table public.health_events          enable row level security;
alter table public.medicines              enable row level security;
alter table public.breeding_records       enable row level security;
alter table public.pregnancy_scans        enable row level security;
alter table public.lambing_records        enable row level security;
alter table public.movements              enable row level security;
alter table public.weaning_records        enable row level security;
alter table public.notes                  enable row level security;
alter table public.contacts               enable row level security;

-- Helper: check authenticated
create or replace function public.is_authenticated()
returns boolean language sql security definer as $$
  select auth.uid() is not null;
$$;

-- ── Profiles: user can read their own; admins read all ─────────
create policy "profiles: own read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: own update"
  on public.profiles for update
  using (auth.uid() = id);

-- ── All other tables: any authenticated user can read/write ────
-- (tighten with org_id in a later migration as needed)

do $$
declare
  tbl text;
  tables text[] := array[
    'breeds','animal_groups','animals','animal_images','animal_weights',
    'animal_registration_details','pedigree_cache','animal_certificates',
    'treatments','health_events','medicines','breeding_records',
    'pregnancy_scans','lambing_records','movements','weaning_records',
    'notes','contacts'
  ];
begin
  foreach tbl in array tables loop
    execute format(
      'create policy "%s: auth select" on public.%I for select using (auth.uid() is not null)',
      tbl, tbl
    );
    execute format(
      'create policy "%s: auth insert" on public.%I for insert with check (auth.uid() is not null)',
      tbl, tbl
    );
    execute format(
      'create policy "%s: auth update" on public.%I for update using (auth.uid() is not null)',
      tbl, tbl
    );
    execute format(
      'create policy "%s: auth delete" on public.%I for delete using (auth.uid() is not null)',
      tbl, tbl
    );
  end loop;
end $$;

-- ══════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- (Run after tables — uses storage schema)
-- ══════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values
  ('animal-images',  'animal-images',  true),
  ('certificates',   'certificates',   false),
  ('documents',      'documents',      false),
  ('avatars',        'avatars',        true)
on conflict (id) do nothing;

-- Storage RLS: authenticated users can upload/read animal-images
create policy "animal-images: auth upload"
  on storage.objects for insert
  with check (bucket_id = 'animal-images' and auth.uid() is not null);

create policy "animal-images: public read"
  on storage.objects for select
  using (bucket_id = 'animal-images');

create policy "animal-images: auth delete"
  on storage.objects for delete
  using (bucket_id = 'animal-images' and auth.uid() is not null);

create policy "avatars: auth upload"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid() is not null);

create policy "avatars: public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "certificates: auth access"
  on storage.objects for all
  using (bucket_id = 'certificates' and auth.uid() is not null)
  with check (bucket_id = 'certificates' and auth.uid() is not null);

create policy "documents: auth access"
  on storage.objects for all
  using (bucket_id = 'documents' and auth.uid() is not null)
  with check (bucket_id = 'documents' and auth.uid() is not null);

-- ══════════════════════════════════════════════════════════════
-- SEED: default breeds for sheep
-- ══════════════════════════════════════════════════════════════
insert into public.breeds (name, species) values
  ('Merino',        'sheep'),
  ('Dorper',        'sheep'),
  ('Van Rooy',      'sheep'),
  ('Damara',        'sheep'),
  ('SA Mutton Merino', 'sheep'),
  ('Dohne Merino',  'sheep'),
  ('Ile de France', 'sheep'),
  ('Suffolk',       'sheep'),
  ('Texel',         'sheep'),
  ('Boer Goat',     'goat'),
  ('Kalahari Red',  'goat'),
  ('Angora',        'goat'),
  ('Angus',         'cattle'),
  ('Hereford',      'cattle'),
  ('Simmental',     'cattle'),
  ('Bonsmara',      'cattle'),
  ('Nguni',         'cattle')
on conflict (name) do nothing;
