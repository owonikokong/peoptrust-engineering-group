import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

// Data layer with two interchangeable backends behind one helper interface:
//  - Supabase (Postgres) when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are
//    set — used in production. See supabase/schema.sql.
//  - A tiny JSON-file store at data/db.json otherwise — used for local
//    development. data/ is gitignored. NOTE: on serverless hosts this file
//    is ephemeral, so production should use Supabase.
// Password hashing stays in the app (scrypt, lib/auth.js) for both backends;
// Supabase Auth is intentionally not used.

const useSupabase = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
);

let supabaseClient = null;
async function supabase() {
  if (!supabaseClient) {
    const { createClient } = await import("@supabase/supabase-js");
    supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );
  }
  return supabaseClient;
}

export function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
}

// ---------------------------------------------------------------------------
// Row <-> app-object mapping (Supabase columns are snake_case)
// ---------------------------------------------------------------------------

function userFromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    role: row.role,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    phone: row.phone || "",
    trade: row.trade || "",
    experience: row.experience_years,
    location: row.location || "",
    companyName: row.company_name || "",
    industry: row.industry || "",
    createdAt: row.created_at,
  };
}

function userToRow(user) {
  return {
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    password_hash: user.passwordHash,
    phone: user.phone || null,
    trade: user.trade || null,
    experience_years:
      user.experience === undefined || user.experience === null
        ? null
        : Number(user.experience),
    location: user.location || null,
    company_name: user.companyName || null,
    industry: user.industry || null,
    created_at: user.createdAt,
  };
}

function jobFromRow(row, companyName = "") {
  if (!row) return null;
  return {
    id: row.id,
    employerId: row.employer_id,
    title: row.title,
    category: row.category,
    location: row.location,
    type: row.type,
    description: row.description,
    requirements: row.requirements || "",
    createdAt: row.created_at,
    companyName,
  };
}

function applicationFromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    jobId: row.job_id,
    userId: row.user_id,
    employerId: row.employer_id || null,
    coverNote: row.cover_note || "",
    status: row.status,
    createdAt: row.created_at,
  };
}

// ---------------------------------------------------------------------------
// File backend
// ---------------------------------------------------------------------------

const DB_PATH = path.join(process.cwd(), "data", "db.json");
const emptyDb = () => ({ users: [], jobs: [], applications: [] });

async function getFileDb() {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    return { ...emptyDb(), ...JSON.parse(raw) };
  } catch {
    return emptyDb();
  }
}

async function saveFileDb(db) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

function companyOf(db, job) {
  const employer = db.users.find((u) => u.id === job.employerId);
  return employer?.companyName || "PeopTrust employer";
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function findUserByEmail(email) {
  const normalized = String(email).toLowerCase();
  if (useSupabase) {
    const sb = await supabase();
    const { data } = await sb
      .from("users")
      .select("*")
      .eq("email", normalized)
      .maybeSingle();
    return userFromRow(data);
  }
  const db = await getFileDb();
  return db.users.find((u) => u.email === normalized) || null;
}

export async function findUserById(id) {
  if (useSupabase) {
    const sb = await supabase();
    const { data } = await sb.from("users").select("*").eq("id", id).maybeSingle();
    return userFromRow(data);
  }
  const db = await getFileDb();
  return db.users.find((u) => u.id === id) || null;
}

export async function createUser(fields) {
  const user = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...fields,
    email: String(fields.email).toLowerCase(),
  };
  if (useSupabase) {
    const sb = await supabase();
    const { error } = await sb.from("users").insert(userToRow(user));
    if (error) throw new Error(`Could not create user: ${error.message}`);
    return user;
  }
  const db = await getFileDb();
  db.users.push(user);
  await saveFileDb(db);
  return user;
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export async function createJob(fields) {
  const job = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...fields,
  };
  if (useSupabase) {
    const sb = await supabase();
    const { error } = await sb.from("jobs").insert({
      id: job.id,
      employer_id: job.employerId,
      title: job.title,
      category: job.category,
      location: job.location,
      type: job.type,
      description: job.description,
      requirements: job.requirements || null,
      created_at: job.createdAt,
    });
    if (error) throw new Error(`Could not create job: ${error.message}`);
    return job;
  }
  const db = await getFileDb();
  db.jobs.push(job);
  await saveFileDb(db);
  return job;
}

export async function listJobs() {
  if (useSupabase) {
    const sb = await supabase();
    const { data, error } = await sb
      .from("jobs")
      .select("*, employer:employer_id(company_name)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Could not list jobs: ${error.message}`);
    return (data || []).map((row) =>
      jobFromRow(row, row.employer?.company_name || "PeopTrust employer")
    );
  }
  const db = await getFileDb();
  return [...db.jobs]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((job) => ({ ...job, companyName: companyOf(db, job) }));
}

export async function getJob(id) {
  if (useSupabase) {
    const sb = await supabase();
    const { data } = await sb
      .from("jobs")
      .select("*, employer:employer_id(company_name)")
      .eq("id", id)
      .maybeSingle();
    return data
      ? jobFromRow(data, data.employer?.company_name || "PeopTrust employer")
      : null;
  }
  const db = await getFileDb();
  const job = db.jobs.find((j) => j.id === id);
  return job ? { ...job, companyName: companyOf(db, job) } : null;
}

export async function listJobsByEmployer(employerId) {
  if (useSupabase) {
    const sb = await supabase();
    const { data: jobs, error } = await sb
      .from("jobs")
      .select("*")
      .eq("employer_id", employerId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Could not list jobs: ${error.message}`);
    const jobIds = (jobs || []).map((j) => j.id);
    const { data: apps } = jobIds.length
      ? await sb.from("applications").select("job_id").in("job_id", jobIds)
      : { data: [] };
    const counts = new Map();
    for (const a of apps || []) counts.set(a.job_id, (counts.get(a.job_id) || 0) + 1);
    return (jobs || []).map((row) => ({
      ...jobFromRow(row),
      applicantCount: counts.get(row.id) || 0,
    }));
  }
  const db = await getFileDb();
  return db.jobs
    .filter((j) => j.employerId === employerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((job) => ({
      ...job,
      applicantCount: db.applications.filter((a) => a.jobId === job.id).length,
    }));
}

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------

export async function createApplication(fields) {
  const application = {
    id: randomUUID(),
    status: "Submitted",
    createdAt: new Date().toISOString(),
    ...fields,
  };
  if (useSupabase) {
    const sb = await supabase();
    const { error } = await sb.from("applications").insert({
      id: application.id,
      job_id: application.jobId,
      user_id: application.userId,
      cover_note: application.coverNote || null,
      status: application.status,
      created_at: application.createdAt,
    });
    if (error) throw new Error(`Could not create application: ${error.message}`);
    return application;
  }
  const db = await getFileDb();
  db.applications.push(application);
  await saveFileDb(db);
  return application;
}

export async function findApplication(userId, jobId) {
  if (useSupabase) {
    const sb = await supabase();
    const { data } = await sb
      .from("applications")
      .select("*")
      .eq("user_id", userId)
      .eq("job_id", jobId)
      .maybeSingle();
    return applicationFromRow(data);
  }
  const db = await getFileDb();
  return (
    db.applications.find((a) => a.userId === userId && a.jobId === jobId) ||
    null
  );
}

export async function listApplicationsForUser(userId) {
  if (useSupabase) {
    const sb = await supabase();
    const { data, error } = await sb
      .from("applications")
      .select("*, job:job_id(title, location, employer:employer_id(company_name))")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Could not list applications: ${error.message}`);
    return (data || []).map((row) => ({
      ...applicationFromRow(row),
      jobTitle: row.job?.title || "Job removed",
      companyName: row.job?.employer?.company_name || "",
      jobLocation: row.job?.location || "",
    }));
  }
  const db = await getFileDb();
  return db.applications
    .filter((a) => a.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((application) => {
      const job = db.jobs.find((j) => j.id === application.jobId);
      const employer = job
        ? db.users.find((u) => u.id === job.employerId)
        : null;
      return {
        ...application,
        jobTitle: job?.title || "Job removed",
        companyName: employer?.companyName || "",
        jobLocation: job?.location || "",
      };
    });
}

export async function listApplicationsForEmployer(employerId) {
  if (useSupabase) {
    const sb = await supabase();
    // Applications link to employers through their job (no employer_id
    // column on applications), so resolve the employer's jobs first.
    const { data: jobs } = await sb
      .from("jobs")
      .select("id, title")
      .eq("employer_id", employerId);
    const jobTitles = new Map((jobs || []).map((j) => [j.id, j.title]));
    if (jobTitles.size === 0) return [];
    const { data, error } = await sb
      .from("applications")
      .select("*, applicant:user_id(name, trade, email)")
      .in("job_id", [...jobTitles.keys()])
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Could not list applications: ${error.message}`);
    return (data || []).map((row) => ({
      ...applicationFromRow(row),
      employerId,
      jobTitle: jobTitles.get(row.job_id) || "Job removed",
      applicantName: row.applicant?.name || "Applicant",
      applicantTrade: row.applicant?.trade || "",
      applicantEmail: row.applicant?.email || "",
    }));
  }
  const db = await getFileDb();
  return db.applications
    .filter((a) => a.employerId === employerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((application) => {
      const job = db.jobs.find((j) => j.id === application.jobId);
      const applicant = db.users.find((u) => u.id === application.userId);
      return {
        ...application,
        jobTitle: job?.title || "Job removed",
        applicantName: applicant?.name || "Applicant",
        applicantTrade: applicant?.trade || "",
        applicantEmail: applicant?.email || "",
      };
    });
}
