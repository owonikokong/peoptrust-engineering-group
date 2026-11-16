import { NextResponse } from "next/server";
import { getSessionUser } from "../../../../lib/auth";
import { ERROR_CODES } from "../../../../lib/error-codes";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Not signed in.", code: ERROR_CODES.NOT_SIGNED_IN },
      { status: 401 },
    );
  }
  return NextResponse.json({ user });
}
