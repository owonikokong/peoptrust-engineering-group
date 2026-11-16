-- PeopTrust Engineering Group — marketplace schema (Supabase / Postgres)
--
-- Apply this in the Supabase dashboard: SQL Editor → paste → Run.
--
-- Row Level Security (RLS) can stay disabled on these tables: the app only
-- ever accesses them server-side (Next.js route handlers and server
-- components) using the SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.
-- Never expose the service role key to the browser.
-- Passwords are hashed in the app (scrypt) before storage; Supabase Auth
-- is not used.

create table if not exists public.users (
  id uuid primary key,
  role text not null check (role in ('professional', 'employer')),
  name text not null,
  email text not null unique,
  password_hash text not null,
  phone text,
  trade text,
  skills text,
  availability text,
  summary text,
  experience_years int,
  previous_experience text,
  certifications text,
  cv_url text,
  location text,
  company_name text,
  industry text,
  company_size text,
  website text,
  company_description text,
  email_verified boolean not null default true,
  verify_code_hash text,
  verify_expires_at timestamptz,
  verify_attempts int not null default 0,
  verify_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key,
  employer_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  category text not null,
  location text not null,
  type text not null,
  description text not null,
  requirements text,
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key,
  job_id uuid not null references public.jobs (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  cover_note text,
  status text not null default 'Submitted',
  created_at timestamptz not null default now(),
  unique (job_id, user_id)
);

create index if not exists jobs_employer_id_idx on public.jobs (employer_id);
create index if not exists applications_job_id_idx on public.applications (job_id);
create index if not exists applications_user_id_idx on public.applications (user_id);

-- ---------------------------------------------------------------------------
-- Migration for databases created before the expanded registration +
-- email-verification release (safe to run more than once). New signups are
-- inserted with email_verified = false by the app; existing accounts keep
-- the default true, so nobody already registered is locked out.
-- ---------------------------------------------------------------------------
alter table public.users add column if not exists skills text;
alter table public.users add column if not exists availability text;
alter table public.users add column if not exists summary text;
alter table public.users add column if not exists company_size text;
alter table public.users add column if not exists website text;
alter table public.users add column if not exists company_description text;
alter table public.users add column if not exists email_verified boolean not null default true;
alter table public.users add column if not exists verify_code_hash text;
alter table public.users add column if not exists verify_expires_at timestamptz;
alter table public.users add column if not exists verify_attempts int not null default 0;
alter table public.users add column if not exists verify_sent_at timestamptz;
alter table public.users add column if not exists previous_experience text;
alter table public.users add column if not exists certifications text;
alter table public.users add column if not exists cv_url text;

-- ============================================================
-- Rate limiting (auth endpoints): one row per hit, counted per
-- key ("<scope>:<ip>") over a rolling window by the app.
-- ============================================================
create table if not exists public.rate_events (
  id bigint generated always as identity primary key,
  key text not null,
  created_at timestamptz not null default now()
);
create index if not exists rate_events_key_created_idx
  on public.rate_events (key, created_at);
