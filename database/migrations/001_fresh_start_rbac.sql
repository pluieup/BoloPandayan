-- ============================================================================
-- BOLO PANDAYAN DATABASE FRESH START + RBAC SETUP
-- ============================================================================
-- Complete schema reset with normalized structure and Row-Level Security (RLS)
-- 
-- INSTRUCTIONS:
-- 1. Backup your current data first (export CSVs via Supabase UI)
-- 2. Copy/paste entire script into Supabase SQL editor
-- 3. Click "Run" (or use keyboard shortcut)
-- 4. Wait for all statements to complete (no errors should appear)
-- 5. Verify: Run verification queries at bottom of this file
--
-- WHAT THIS DOES:
-- - Drops all old tables, policies, functions, triggers (CASCADES)
-- - Creates fresh normalized tables with proper FKs + constraints
-- - Enables RLS on all tables
-- - Creates developer/LGU helper functions
-- - Sets up ownership-based + role-based policies
-- - Adds field-level protection trigger for profiles
-- ============================================================================

-- ============================================================================
-- PART 1: DROP EVERYTHING SAFELY
-- ============================================================================

-- Drop triggers first (they depend on functions)
drop trigger if exists protect_profile_updates on public.tbl_user_profiles;

-- Drop functions
drop function if exists public.protect_profile_fields();
drop function if exists public.is_admin();
drop function if exists public.is_developer();
drop function if exists public.is_lgu_admin_approved();

-- Drop all RLS policies across all tables
drop policy if exists "Allow public read access for profiles" on public.tbl_user_profiles;
drop policy if exists "Users can edit their own profile" on public.tbl_user_profiles;
drop policy if exists "profiles_admin_manage_artisans" on public.tbl_user_profiles;
drop policy if exists "profiles_insert_own" on public.tbl_user_profiles;
drop policy if exists "profiles_public_read_approved_artisans" on public.tbl_user_profiles;
drop policy if exists "profiles_read_authenticated" on public.tbl_user_profiles;
drop policy if exists "profiles_update_own" on public.tbl_user_profiles;
drop policy if exists "profiles_select_authenticated" on public.tbl_user_profiles;
drop policy if exists "profiles_select_anon_approved" on public.tbl_user_profiles;
drop policy if exists "profiles_insert_anon_registration" on public.tbl_user_profiles;
drop policy if exists "profiles_insert_self" on public.tbl_user_profiles;
drop policy if exists "profiles_update_self" on public.tbl_user_profiles;
drop policy if exists "profiles_admin_manage_all" on public.tbl_user_profiles;
drop policy if exists "profiles_developer_manage_all" on public.tbl_user_profiles;
drop policy if exists "profiles_lgu_admin_manage_artisans" on public.tbl_user_profiles;

drop policy if exists "Allow authenticated inserts for workshops" on public.tbl_workshops;
drop policy if exists "Allow authenticated updates for workshops" on public.tbl_workshops;
drop policy if exists "Allow public read access for workshops" on public.tbl_workshops;
drop policy if exists "Only logged in users can add workshops" on public.tbl_workshops;
drop policy if exists "workshops_insert_owner" on public.tbl_workshops;
drop policy if exists "workshops_public_read" on public.tbl_workshops;
drop policy if exists "workshops_read_authenticated" on public.tbl_workshops;
drop policy if exists "workshops_update_owner" on public.tbl_workshops;
drop policy if exists "workshops_insert_owner_or_admin" on public.tbl_workshops;
drop policy if exists "workshops_update_owner_or_admin" on public.tbl_workshops;
drop policy if exists "workshops_delete_owner_or_admin" on public.tbl_workshops;
drop policy if exists "workshops_select_public" on public.tbl_workshops;
drop policy if exists "workshops_insert_owner_or_developer" on public.tbl_workshops;
drop policy if exists "workshops_update_owner_or_developer" on public.tbl_workshops;
drop policy if exists "workshops_delete_owner_or_developer" on public.tbl_workshops;

drop policy if exists "products_delete_own" on public.tbl_products;
drop policy if exists "products_insert_own" on public.tbl_products;
drop policy if exists "products_read_public" on public.tbl_products;
drop policy if exists "products_update_own" on public.tbl_products;
drop policy if exists "products_insert_owner_or_admin" on public.tbl_products;
drop policy if exists "products_update_owner_or_admin" on public.tbl_products;
drop policy if exists "products_delete_owner_or_admin" on public.tbl_products;
drop policy if exists "products_select_public" on public.tbl_products;
drop policy if exists "products_insert_owner_or_developer" on public.tbl_products;
drop policy if exists "products_update_owner_or_developer" on public.tbl_products;
drop policy if exists "products_delete_owner_or_developer_or_lgu" on public.tbl_products;

drop policy if exists "damage_reports_admin_delete" on public.tbl_damage_reports;
drop policy if exists "damage_reports_admin_insert" on public.tbl_damage_reports;
drop policy if exists "damage_reports_admin_update" on public.tbl_damage_reports;
drop policy if exists "damage_reports_public_read" on public.tbl_damage_reports;
drop policy if exists "damage_reports_write_owner_or_admin" on public.tbl_damage_reports;
drop policy if exists "damage_reports_select_public" on public.tbl_damage_reports;
drop policy if exists "damage_reports_write_owner_or_developer_or_lgu" on public.tbl_damage_reports;

drop policy if exists "risk_assessments_select_public" on public.tbl_workshop_risk_assessments;
drop policy if exists "risk_assessments_write_admin" on public.tbl_workshop_risk_assessments;
drop policy if exists "risk_assessments_write_developer_or_lgu" on public.tbl_workshop_risk_assessments;

-- Drop tables in reverse dependency order (CASCADE handles FK cleanup)
drop table if exists public.tbl_damage_reports cascade;
drop table if exists public.tbl_workshop_risk_assessments cascade;
drop table if exists public.tbl_products cascade;
drop table if exists public.tbl_workshops cascade;
drop table if exists public.tbl_user_profiles cascade;

-- Drop any old indexes
drop index if exists idx_profiles_workshop_id;
drop index if exists idx_profiles_role;
drop index if exists idx_workshops_owner_id;
drop index if exists idx_products_workshop_id;
drop index if exists idx_damage_reports_workshop_id;
drop index if exists idx_damage_reports_created_by;
drop index if exists idx_risk_assessments_workshop_id;


-- ============================================================================
-- PART 2: CREATE CLEAN NORMALIZED TABLES
-- ============================================================================

-- Table: User Profiles (Artisans, LGU Admins, Developers)
-- Master directory of all users in the system
create table public.tbl_user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null 
    default 'artisan' 
    check (role in ('artisan', 'lgu_admin', 'developer')),
  account_status text not null 
    default 'pending' 
    check (account_status in ('pending', 'pending_approval', 'approved', 'Approved', 'rejected', 'revoked')),
  is_approved boolean default false,
  status_feedback text,
  workshop_id uuid,
  region text,
  valid_id_url text,
  profile_photo_url text,
  bio text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table public.tbl_user_profiles is 'Master user directory. Role hierarchy: developer (master) > lgu_admin > artisan. Region supports LGU jurisdiction.';


-- Table: Workshops (Owner-based master entities)
-- A workshop is owned by ONE artisan (owner_id), can have many artisan members (via tbl_user_profiles.workshop_id)
create table public.tbl_workshops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.tbl_user_profiles(id) on delete restrict,
  name text not null,
  address text,
  description text,
  banner_url text,
  lat numeric(10, 8),
  lng numeric(11, 8),
  safety_score numeric default 0,
  ground_rupture text default 'Safe',
  ground_shaking text default 'Safe',
  earthquake_induced_landslide text default 'Safe',
  liquefaction_risk text default 'Safe',
  tsunami_risk text default 'Safe',
  ashfall_risk text default 'Safe',
  landslide_risk text default 'Safe',
  storm_surge_risk text default 'Safe',
  nearest_volcano_distance numeric default 0,
  nearest_volcano_direction text default 'NW',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table public.tbl_workshops is 'Workshops owned by artisans. Only owner_id can edit. Members link via tbl_user_profiles.workshop_id.';


-- Add FK constraint from profiles to workshops (member assignment)
alter table public.tbl_user_profiles
add constraint fk_profiles_workshop
foreign key (workshop_id) references public.tbl_workshops(id) on delete set null;


-- Table: Products (Bolo masterworks by workshop)
-- Belongs to a workshop, inherits ownership from workshop.owner_id
create table public.tbl_products (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references public.tbl_workshops(id) on delete cascade,
  name text not null,
  blade_material text,
  handle_material text,
  price numeric,
  description text,
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table public.tbl_products is 'Heritage bolo products. Owners manage their own products; developer and approved LGU admins can moderate based on policy.';


-- Table: Damage Reports (Disaster/incident records)
-- Belongs to a workshop, created/edited by owners, LGU admins, or developers
create table public.tbl_damage_reports (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references public.tbl_workshops(id) on delete cascade,
  incident_date date,
  disaster_type text,
  description text,
  estimated_cost numeric,
  admin_notes text,
  created_by uuid references public.tbl_user_profiles(id) on delete set null,
  created_at timestamp with time zone default now(),
  last_edited_by uuid references public.tbl_user_profiles(id) on delete set null,
  updated_at timestamp with time zone default now()
);

comment on table public.tbl_damage_reports is 'Disaster/damage records. Workshop owner, approved LGU admin, or developer can write. Public read for transparency.';


-- Table: Workshop Risk Assessments (Risk profile snapshots)
create table public.tbl_workshop_risk_assessments (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references public.tbl_workshops(id) on delete cascade,
  risk_score numeric,
  risk_label text,
  hazard_snapshot jsonb,
  assessed_at timestamp with time zone default now(),
  assessed_by uuid references public.tbl_user_profiles(id) on delete set null,
  created_at timestamp with time zone default now()
);

comment on table public.tbl_workshop_risk_assessments is 'Risk assessment snapshots. Approved LGU admins and developers create and update. Public read.';


-- ============================================================================
-- PART 3: CREATE INDEXES (Performance)
-- ============================================================================

create index idx_profiles_workshop_id on public.tbl_user_profiles(workshop_id);
create index idx_profiles_role on public.tbl_user_profiles(role);
create index idx_profiles_account_status on public.tbl_user_profiles(account_status);

create index idx_workshops_owner_id on public.tbl_workshops(owner_id);
create index idx_workshops_created_at on public.tbl_workshops(created_at);

create index idx_products_workshop_id on public.tbl_products(workshop_id);
create index idx_products_created_at on public.tbl_products(created_at);

create index idx_damage_reports_workshop_id on public.tbl_damage_reports(workshop_id);
create index idx_damage_reports_created_by on public.tbl_damage_reports(created_by);

create index idx_risk_assessments_workshop_id on public.tbl_workshop_risk_assessments(workshop_id);
create index idx_risk_assessments_assessed_at on public.tbl_workshop_risk_assessments(assessed_at);


-- ============================================================================
-- PART 4: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

alter table public.tbl_user_profiles enable row level security;
alter table public.tbl_workshops enable row level security;
alter table public.tbl_products enable row level security;
alter table public.tbl_damage_reports enable row level security;
alter table public.tbl_workshop_risk_assessments enable row level security;

-- OPTIONAL: Force RLS (prevents table owner/superuser from bypassing policies)
-- Uncomment if you want strict enforcement even for Supabase backend role
-- alter table public.tbl_user_profiles force row level security;
-- alter table public.tbl_workshops force row level security;
-- alter table public.tbl_products force row level security;
-- alter table public.tbl_damage_reports force row level security;
-- alter table public.tbl_workshop_risk_assessments force row level security;


-- ============================================================================
-- PART 5: CREATE HELPER FUNCTIONS
-- ============================================================================

-- Helper: Check if current user is developer (master approval authority)
create or replace function public.is_developer()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.tbl_user_profiles p
    where p.id = auth.uid()
      and p.role = 'developer'
  );
$$;

comment on function public.is_developer() is 'Returns true if authenticated user has developer role.';

-- Helper: Check if current user is an approved LGU admin
create or replace function public.is_lgu_admin_approved()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.tbl_user_profiles p
    where p.id = auth.uid()
      and p.role = 'lgu_admin'
      and p.is_approved = true
      and lower(coalesce(p.account_status, '')) = 'approved'
  );
$$;

comment on function public.is_lgu_admin_approved() is 'Returns true if authenticated user is an approved LGU admin.';


-- ============================================================================
-- PART 6: SET UP RLS POLICIES (RBAC)
-- ============================================================================

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Policy: Authenticated users can read all profiles
create policy profiles_select_authenticated
on public.tbl_user_profiles
for select
to authenticated
using (true);

-- Policy: Anonymous can only read approved artisans
create policy profiles_select_anon_approved
on public.tbl_user_profiles
for select
to anon
using (
  role = 'artisan'
  and (is_approved = true or account_status = any(array['approved', 'Approved']))
);

-- Policy: Anonymous users can insert their own profile during registration
create policy profiles_insert_anon_registration
on public.tbl_user_profiles
for insert
to anon
with check (
  id = auth.uid()
  and role in ('artisan', 'lgu_admin')
  and is_approved = false
  and account_status in ('pending', 'pending_approval')
);

-- Policy: Users can insert their own profile (during registration)
create policy profiles_insert_self
on public.tbl_user_profiles
for insert
to authenticated
with check (
  id = auth.uid()
  and role in ('artisan', 'lgu_admin')
  and is_approved = false
  and account_status in ('pending', 'pending_approval')
);

-- Policy: Users can update their own profile (bio, photo, etc.)
create policy profiles_update_self
on public.tbl_user_profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Policy: Developer can update any profile (approve LGU admins, role/status management)
create policy profiles_developer_manage_all
on public.tbl_user_profiles
for update
to authenticated
using (public.is_developer())
with check (public.is_developer());

-- Policy: Approved LGU admins can update artisan profiles
create policy profiles_lgu_admin_manage_artisans
on public.tbl_user_profiles
for update
to authenticated
using (public.is_lgu_admin_approved() and role = 'artisan')
with check (public.is_lgu_admin_approved() and role = 'artisan');


-- ============================================================================
-- WORKSHOPS POLICIES
-- ============================================================================

-- Policy: Everyone (anon + authenticated) can read workshops
create policy workshops_select_public
on public.tbl_workshops
for select
to anon, authenticated
using (true);

-- Policy: Only owner or developer can insert new workshop
create policy workshops_insert_owner_or_developer
on public.tbl_workshops
for insert
to authenticated
with check (owner_id = auth.uid() or public.is_developer());

-- Policy: Only owner or developer can update workshop
create policy workshops_update_owner_or_developer
on public.tbl_workshops
for update
to authenticated
using (owner_id = auth.uid() or public.is_developer())
with check (owner_id = auth.uid() or public.is_developer());

-- Policy: Only owner or developer can delete workshop
create policy workshops_delete_owner_or_developer
on public.tbl_workshops
for delete
to authenticated
using (owner_id = auth.uid() or public.is_developer());


-- ============================================================================
-- PRODUCTS POLICIES
-- ============================================================================

-- Policy: Everyone can read products (public gallery)
create policy products_select_public
on public.tbl_products
for select
to anon, authenticated
using (true);

-- Policy: Workshop owner, approved artisan member, or developer can insert products
create policy products_insert_owner_or_developer
on public.tbl_products
for insert
to authenticated
with check (
  exists (
    select 1
    from public.tbl_workshops w
    where w.id = workshop_id
      and (
        w.owner_id = auth.uid()
        or public.is_developer()
        or exists (
          select 1
          from public.tbl_user_profiles p
          where p.id = auth.uid()
            and p.role = 'artisan'
            and p.workshop_id = w.id
            and lower(coalesce(p.account_status, '')) = 'approved'
        )
      )
  )
);

-- Policy: Workshop owner, approved artisan member, or developer can update products
create policy products_update_owner_or_developer
on public.tbl_products
for update
to authenticated
using (
  exists (
    select 1
    from public.tbl_workshops w
    where w.id = workshop_id
      and (
        w.owner_id = auth.uid()
        or public.is_developer()
        or exists (
          select 1
          from public.tbl_user_profiles p
          where p.id = auth.uid()
            and p.role = 'artisan'
            and p.workshop_id = w.id
            and lower(coalesce(p.account_status, '')) = 'approved'
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.tbl_workshops w
    where w.id = workshop_id
      and (
        w.owner_id = auth.uid()
        or public.is_developer()
        or exists (
          select 1
          from public.tbl_user_profiles p
          where p.id = auth.uid()
            and p.role = 'artisan'
            and p.workshop_id = w.id
            and lower(coalesce(p.account_status, '')) = 'approved'
        )
      )
  )
);

-- Policy: Workshop owner, approved LGU admin, or developer can delete products
create policy products_delete_owner_or_developer_or_lgu
on public.tbl_products
for delete
to authenticated
using (
  exists (
    select 1
    from public.tbl_workshops w
    where w.id = workshop_id
      and (w.owner_id = auth.uid() or public.is_developer())
  )
  or public.is_lgu_admin_approved()
);


-- ============================================================================
-- DAMAGE REPORTS POLICIES
-- ============================================================================

-- Policy: Everyone can read damage reports (public transparency)
create policy damage_reports_select_public
on public.tbl_damage_reports
for select
to anon, authenticated
using (true);

-- Policy: Workshop owner, approved LGU admin, or developer can write damage reports
create policy damage_reports_write_owner_or_developer_or_lgu
on public.tbl_damage_reports
for all
to authenticated
using (
  exists (
    select 1
    from public.tbl_workshops w
    where w.id = workshop_id
      and (w.owner_id = auth.uid() or public.is_developer())
  )
  or public.is_lgu_admin_approved()
)
with check (
  exists (
    select 1
    from public.tbl_workshops w
    where w.id = workshop_id
      and (w.owner_id = auth.uid() or public.is_developer())
  )
  or public.is_lgu_admin_approved()
);


-- ============================================================================
-- RISK ASSESSMENTS POLICIES
-- ============================================================================

-- Policy: Everyone can read risk assessments
create policy risk_assessments_select_public
on public.tbl_workshop_risk_assessments
for select
to anon, authenticated
using (true);

-- Policy: Only approved LGU admins or developers can write risk assessments
create policy risk_assessments_write_developer_or_lgu
on public.tbl_workshop_risk_assessments
for all
to authenticated
using (public.is_developer() or public.is_lgu_admin_approved())
with check (public.is_developer() or public.is_lgu_admin_approved());


-- ============================================================================
-- PART 7: FIELD-LEVEL PROTECTION (Prevent users from changing their own role/status)
-- ============================================================================

create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- If user is NOT developer and is updating their own profile
  if (select not public.is_developer()) and new.id = auth.uid() then
    
    -- Prevent changes to sensitive fields
    if old.role is distinct from new.role then
      raise exception 'Cannot change your own role. Contact developer.';
    end if;
    
    if old.is_approved is distinct from new.is_approved then
      raise exception 'Cannot change your approval status. Contact developer.';
    end if;
    
    if old.account_status is distinct from new.account_status then
      raise exception 'Cannot change your account status. Contact developer.';
    end if;
    
  end if;
  
  return new;
end;
$$;

create trigger protect_profile_updates
before update on public.tbl_user_profiles
for each row
execute function public.protect_profile_fields();


-- ============================================================================
-- PART 8: TIGHTEN TABLE GRANTS (Optional)
-- ============================================================================
-- Prevent anon/authenticated from using TRUNCATE/TRIGGER (requires elevated role)

revoke truncate, trigger on public.tbl_user_profiles from anon, authenticated;
revoke truncate, trigger on public.tbl_workshops from anon, authenticated;
revoke truncate, trigger on public.tbl_products from anon, authenticated;
revoke truncate, trigger on public.tbl_damage_reports from anon, authenticated;
revoke truncate, trigger on public.tbl_workshop_risk_assessments from anon, authenticated;


-- ============================================================================
-- PART 9: CREATE STORAGE BUCKETS
-- ============================================================================
-- Note: Run these commands in Supabase SQL Editor to create storage buckets

-- To create buckets, use Supabase Dashboard > Storage or via SQL edge functions
-- IMPORTANT: Supabase storage buckets are typically created via the Dashboard UI or API
-- The following SQL is provided as reference for RLS policies only

-- Bucket 1: 'bolos' - Product images, profile photos, workshop banners
-- Create via UI: Storage > New Bucket > Public > Name: bolos
-- Path pattern: workshopId/{fileName} or userId/{fileName}

-- Bucket 2: 'artisan_ids' - Artisan registration ID documents
-- Create via UI: Storage > New Bucket > Private > Name: artisan_ids
-- Path pattern: userId_timestamp.ext


-- ============================================================================
-- PART 10: STORAGE RLS POLICIES
-- ============================================================================
-- NOTE: Supabase automatically manages RLS on storage.objects
-- We only need to create policies below; do NOT alter the table directly

-- Drop old policies if they exist
drop policy if exists "Public read bolos" on storage.objects;
drop policy if exists "Authenticated upload bolos" on storage.objects;
drop policy if exists "Authenticated manage own bolos" on storage.objects;
drop policy if exists "Authenticated update own bolos" on storage.objects;
drop policy if exists "Authenticated delete own bolos" on storage.objects;
drop policy if exists "Authenticated read artisan_ids" on storage.objects;
drop policy if exists "Authenticated upload artisan_ids" on storage.objects;

-- ============================================================================
-- BOLOS BUCKET POLICIES (product images, profile photos, workshop banners)
-- ============================================================================

-- Policy: Public read access to bolos bucket (images are public)
create policy "Public read bolos"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'bolos');

-- Policy: Authenticated users can upload to bolos
-- Users can upload to their own user directory, own workshop, or approved artisan member workshop
create policy "Authenticated upload bolos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'bolos'
  and (
    -- User can upload to their own directory (userId/...)
    (storage.foldername(name))[1]::uuid = auth.uid()
    or
    -- User can upload to a workshop they own
    exists (
      select 1
      from public.tbl_workshops w
      where w.id = (storage.foldername(name))[1]::uuid
        and w.owner_id = auth.uid()
    )
    or
    -- Approved artisan member can upload to their linked workshop directory
    exists (
      select 1
      from public.tbl_user_profiles p
      where p.id = auth.uid()
        and p.role = 'artisan'
        and p.workshop_id = (storage.foldername(name))[1]::uuid
        and lower(coalesce(p.account_status, '')) = 'approved'
    )
  )
);

-- Policy: Authenticated users can update/delete their own files in bolos
create policy "Authenticated manage own bolos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'bolos'
  and (
    (storage.foldername(name))[1]::uuid = auth.uid()
    or
    exists (
      select 1
      from public.tbl_workshops w
      where w.id = (storage.foldername(name))[1]::uuid
        and w.owner_id = auth.uid()
    )
    or
    exists (
      select 1
      from public.tbl_user_profiles p
      where p.id = auth.uid()
        and p.role = 'artisan'
        and p.workshop_id = (storage.foldername(name))[1]::uuid
        and lower(coalesce(p.account_status, '')) = 'approved'
    )
  )
);

-- Policy: Authenticated users can delete their own files in bolos
create policy "Authenticated delete own bolos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'bolos'
  and (
    (storage.foldername(name))[1]::uuid = auth.uid()
    or
    exists (
      select 1
      from public.tbl_workshops w
      where w.id = (storage.foldername(name))[1]::uuid
        and w.owner_id = auth.uid()
    )
    or
    exists (
      select 1
      from public.tbl_user_profiles p
      where p.id = auth.uid()
        and p.role = 'artisan'
        and p.workshop_id = (storage.foldername(name))[1]::uuid
        and lower(coalesce(p.account_status, '')) = 'approved'
    )
  )
);

-- ============================================================================
-- ARTISAN_IDS BUCKET POLICIES (validation documents)
-- ============================================================================

-- Policy: Authenticated users can read their own ID documents
create policy "Authenticated read own artisan_ids"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'artisan_ids'
  and auth.uid()::text = split_part(name, '_', 1)::text
);

-- Policy: Authenticated users (artisans) can upload their ID during registration
create policy "Authenticated upload artisan_ids"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'artisan_ids'
  and auth.uid()::text = split_part(name, '_', 1)::text
  and exists (
    select 1
    from public.tbl_user_profiles p
    where p.id = auth.uid()
      and p.role = 'artisan'
  )
);

-- Policy: Developers can read all artisan IDs (for approval verification)
create policy "Developer read all artisan_ids"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'artisan_ids'
  and public.is_developer()
);

-- Policy: Developers can delete artisan ID files (for data cleanup)
create policy "Developer delete artisan_ids"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'artisan_ids'
  and public.is_developer()
);


-- ============================================================================
-- VERIFICATION QUERIES (Run these to test the setup)
-- ============================================================================

/*
-- Check tables created
select tablename from pg_tables 
where schemaname = 'public' and tablename like 'tbl_%'
order by tablename;

-- Check indexes created
select indexname from pg_indexes 
where schemaname = 'public' and indexname like 'idx_%'
order by indexname;

-- Check RLS enabled on all key tables
select
  n.nspname as schemaname,
  c.relname as tablename,
  c.relrowsecurity,
  c.relforcerowsecurity
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname like 'tbl_%'
order by c.relname;

-- Check policies are clean (no old ones remain)
select
  schemaname,
  tablename,
  policyname,
  cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- Check is_developer() function exists
select proname, prosecdef from pg_proc 
where proname = 'is_developer';

-- Check is_lgu_admin_approved() function exists
select proname, prosecdef from pg_proc 
where proname = 'is_lgu_admin_approved';

-- Check protect_profile_fields() function
select proname, prosecdef from pg_proc 
where proname = 'protect_profile_fields';

-- Count triggers
select count(*) as trigger_count from pg_trigger 
where tgrelid in (
  select oid from pg_class where relname in (
    'tbl_user_profiles', 'tbl_workshops', 'tbl_products'
  )
);
*/
