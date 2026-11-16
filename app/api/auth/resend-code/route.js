import { NextResponse } from "next/server";
import { rateLimit, tooManyRequests } from "../../../../lib/ratelimit";
import { getSessionUser } from "../../../../lib/auth";
import {
  findUserById,
  isVerified,
  updateUserFields,
} from "../../../../lib/store";
import { newCodeFields, RESEND_COOLDOWN_MS } from "../../../../lib/verify";
import { sendVerificationEmail } from "../../../../lib/mail";

export async function POST(request) {
  const rl = await rateLimit(request, "resend");
  if (!rl.ok) return tooManyRequests(rl.retryAfter);
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  }
  const user = await findUserById(sessionUser.id);
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }
  if (isVerified(user)) {
    return NextResponse.json({ verified: true });
  }

  if (user.verifySentAt) {
    const elapsed = Date.now() - new Date(user.verifySentAt).getTime();
    if (elapsed < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      return NextResponse.json(
        { error: `Please wait ${wait} seconds before requesting another code.` },
        { status: 429 }
      );
    }
  }

  const { code, fields } = newCodeFields(user.id);
  await updateUserFields(user.id, fields);
  const mail = await sendVerificationEmail({
    email: user.email,
    name: user.name,
    code,
  });
  return NextResponse.json({ sent: true, mailSent: mail.sent });
}
