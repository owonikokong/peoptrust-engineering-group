import { NextResponse } from "next/server";
import { rateLimit, tooManyRequests } from "../../../../lib/ratelimit";
import { getSessionUser } from "../../../../lib/auth";
import { findUserById, isVerified } from "../../../../lib/store";
import { resendStatus } from "../../../../lib/states";
import { issueVerificationCode } from "../../../../lib/transitions";
import { sendVerificationEmail } from "../../../../lib/mail";
import { ERROR_CODES } from "../../../../lib/error-codes";

export async function POST(request) {
  const rl = await rateLimit(request, "resend");
  if (!rl.ok) return tooManyRequests(rl.retryAfter);
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json(
      { error: "Please log in first.", code: ERROR_CODES.NOT_SIGNED_IN },
      { status: 401 }
    );
  }
  const user = await findUserById(sessionUser.id);
  if (!user) {
    return NextResponse.json(
      { error: "Account not found.", code: ERROR_CODES.ACCOUNT_NOT_FOUND },
      { status: 404 }
    );
  }
  if (isVerified(user)) {
    return NextResponse.json({ verified: true });
  }

  // One derivation of the resend-cooldown status (lib/states): same
  // check, same wait computation, same message as the inline version.
  const resend = resendStatus(user);
  if (!resend.allowed) {
    return NextResponse.json(
      { error: `Please wait ${resend.waitSeconds} seconds before requesting another code.`, code: ERROR_CODES.RESEND_COOLDOWN },
      { status: 429 }
    );
  }

  const { code } = await issueVerificationCode(user);
  const mail = await sendVerificationEmail({
    email: user.email,
    name: user.name,
    code,
  });
  return NextResponse.json({ sent: true, mailSent: mail.sent });
}
