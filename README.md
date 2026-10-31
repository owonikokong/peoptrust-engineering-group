# PeopTrust Engineering Group

PeopTrust Engineering Group is an engineering services and skilled-labour
marketplace in Nigeria. Founded in 2021 and bootstrapped, PeopTrust connects
employers with capable engineering professionals while delivering reliable
technical services, equipment sourcing and project support across civil,
mechanical, electrical and environmental engineering, project management and
industrial maintenance.

**Live site:** https://engisource-nigeria.vercel.app

## Tech stack

- [Next.js](https://nextjs.org) (App Router, JavaScript) with React
- Plain CSS (`app/globals.css`) — no CSS framework
- Hosted and deployed on [Vercel](https://vercel.com)
- Marketplace data: [Supabase](https://supabase.com) (Postgres) in production,
  with a local JSON-file fallback for development

## Marketplace: accounts, jobs and dashboards

The site includes a working two-sided marketplace:

- **Registration** (`/register`) with a role toggle — *Skilled Professionals*
  (name, email, password, phone, trade, years of experience, location) and
  *Employers* (company name, contact person, work email, password, phone,
  industry, company location). Successful registration signs the user in and
  lands on the dashboard.
- **Login** (`/login`) with signed, http-only cookie sessions (7 days).
  Passwords are hashed in the app with scrypt (per-user salt) — Supabase Auth
  is not used.
- **Jobs** (`/jobs`, `/jobs/[id]`) — public listings posted by employers.
  Logged-in professionals can apply (with an optional cover note); duplicate
  applications are rejected.
- **Dashboards** (`/dashboard`) — professionals see their profile and the
  jobs they applied to; employers get a "Post a job" form, their posted jobs
  with applicant counts, and the list of applicants per job.

API routes live under `app/api/` (`auth/register`, `auth/login`,
`auth/logout`, `auth/me`, `jobs`, `jobs/[id]/apply`) and all data access goes
through the single store layer in `lib/store.js`.

### Data backends and environment variables

`lib/store.js` picks its backend from the environment:

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL. When set together with the service role key, the Supabase backend is used. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only — never expose to the browser). |
| `AUTH_SECRET` | Secret used to sign session cookies. Set a long random value in production; a development fallback is used locally when unset. |

**Supabase setup:** create a project at supabase.com, open the SQL Editor,
paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and run it
(it creates the `users`, `jobs` and `applications` tables). Then set
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API) in
`.env.local` for local runs and in the Vercel project settings for
production, and redeploy. Row Level Security can stay disabled because all
access is server-side with the service role key.

**Local fallback:** with no Supabase variables set, data is stored in
`data/db.json` (created on first use, gitignored). Note: on Vercel's
serverless filesystem the JSON store is ephemeral — connect a hosted
database (Supabase, as above) for durable production data; the store layer
in `lib/store.js` is the single place to swap backends.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

To create a production build:

```bash
npm run build
npm run start
```

## Structure

```
app/
  layout.js        Shared header, navigation and footer
  globals.css      Site-wide styles (green/navy palette)
  page.js          Home page
  services/        Services page
  projects/        Projects page
  about/           About page
  contact/         Contact page
  register/        Role-based registration (professional / employer)
  login/           Login page
  jobs/            Public job listings and job detail / apply pages
  dashboard/       Role-aware dashboards for professionals and employers
  components/      Client components (apply form, post-a-job form, logout)
  api/             JSON API routes (auth, jobs, applications)
lib/
  data.js          Services and projects content used across pages
  store.js         Data layer — Supabase backend, JSON-file fallback
  auth.js          Password hashing (scrypt) and signed session cookies
supabase/
  schema.sql       Postgres schema for the Supabase backend
data/
  db.json          Local file-store data (created on first use, gitignored)
```

## Note on this source

This source was rebuilt in October 2026 to match the live site, so that the
code behind the deployed website is preserved in version control. Page content
(services, projects, stats and contact details) mirrors what is published at
the live URL above.
