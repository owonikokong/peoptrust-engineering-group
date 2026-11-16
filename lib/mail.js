// Verification email delivery.
//
// Uses the Resend API when RESEND_API_KEY is set in the environment
// (MAIL_FROM optionally overrides the sender; Resend's onboarding sender
// works for testing). With no provider configured the code is written to
// the server log only — registration still succeeds and the user can use
// "resend" once a provider is connected.

export async function sendVerificationEmail({ email, name, code }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[mail:dev] Verification code for ${email}: ${code}`);
    return { sent: false, dev: true };
  }
  const from = process.env.MAIL_FROM || "PeopTrust <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Your PeopTrust verification code",
        text: `Hello ${name || "there"},\n\nYour PeopTrust verification code is ${code}.\nIt expires in 30 minutes. If you did not create a PeopTrust account, you can ignore this email.\n\n— PeopTrust Engineering Group`,
        html: `<p>Hello ${name || "there"},</p><p>Your PeopTrust verification code is:</p><p style="font-size:28px;font-weight:800;letter-spacing:6px;color:#0b1f3a">${code}</p><p>It expires in 30 minutes. If you did not create a PeopTrust account, you can ignore this email.</p><p>— PeopTrust Engineering Group</p>`,
      }),
    });
    if (!res.ok) {
      console.error("[mail] Resend send failed:", res.status, await res.text());
      return { sent: false, dev: false };
    }
    return { sent: true, dev: false };
  } catch (err) {
    console.error("[mail] Resend send error:", err);
    return { sent: false, dev: false };
  }
}
