import { NextResponse } from "next/server";
import { createJob, listJobs } from "../../../lib/store";
import { getSessionUser } from "../../../lib/auth";
import { services } from "../../../lib/data";

const CATEGORIES = services.map((s) => s.title);
const TYPES = ["Full-time", "Contract", "Part-time"];

export async function GET() {
  const jobs = await listJobs();
  return NextResponse.json({ jobs });
}

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  }
  if (user.role !== "employer") {
    return NextResponse.json(
      { error: "Only employers can post jobs." },
      { status: 403 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { title, category, location, type, description, requirements } = body || {};
  if (!title || !String(title).trim()) {
    return NextResponse.json({ error: "Please enter a job title." }, { status: 400 });
  }
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json(
      { error: "Please choose a valid job category." },
      { status: 400 }
    );
  }
  if (!location || !String(location).trim()) {
    return NextResponse.json({ error: "Please enter the job location." }, { status: 400 });
  }
  if (!TYPES.includes(type)) {
    return NextResponse.json(
      { error: "Please choose a valid job type." },
      { status: 400 }
    );
  }
  if (!description || !String(description).trim()) {
    return NextResponse.json(
      { error: "Please describe the job." },
      { status: 400 }
    );
  }

  const job = await createJob({
    employerId: user.id,
    title: String(title).trim(),
    category,
    location: String(location).trim(),
    type,
    description: String(description).trim(),
    requirements: requirements ? String(requirements).trim() : "",
  });

  return NextResponse.json(
    { job: { ...job, companyName: user.companyName } },
    { status: 201 }
  );
}
