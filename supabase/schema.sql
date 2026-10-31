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
  experience_years int,
  location text,
  company_name text,
  industry text,
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
