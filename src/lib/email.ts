import { Resend } from "resend";

let client: Resend | null = null;

function getClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

function otpEmailHtml(code: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#f6f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f7fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:28px 32px 0 32px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <div style="width:28px;height:28px;border-radius:8px;background-color:#4f46e5;display:inline-block;"></div>
                  <span style="font-size:16px;font-weight:700;color:#12141c;vertical-align:middle;">StockSense</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 8px 32px;">
                <h1 style="margin:0;font-size:19px;color:#12141c;">Reset your password</h1>
                <p style="margin:12px 0 0 0;font-size:14px;line-height:1.6;color:#6b7280;">
                  Hi,<br />
                  We received a request to reset your StockSense password. Your verification code is:
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px;">
                <div style="background-color:#eef2ff;border-radius:12px;padding:18px 0;text-align:center;">
                  <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#4338ca;">${code}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 28px 32px;">
                <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">
                  This code expires in 10 minutes. If you did not request a password reset, you can safely ignore this email.
                </p>
                <p style="margin:20px 0 0 0;font-size:13px;color:#9ca3af;">— StockSense Team</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function otpEmailText(code: string) {
  return `Hi,

We received a request to reset your StockSense password.

Your verification code is:

${code}

This code expires in 10 minutes.

If you did not request a password reset, you can safely ignore this email.

— StockSense Team`;
}

/**
 * Sends the OTP email via Resend. Throws EMAIL_DELIVERY_FAILED if a provider
 * is configured but the send fails, so the caller can show a generic error
 * without leaking provider details. Falls back to a console log — clearly
 * marked as a dev-only path — when RESEND_API_KEY isn't set at all.
 */
export async function sendOtpEmail(to: string, code: string) {
  const resend = getClient();

  if (!resend) {
    console.log(`[StockSense][DEV FALLBACK — RESEND_API_KEY not set] OTP for ${to}: ${code}`);
    return;
  }

  const from = process.env.EMAIL_FROM ?? "StockSense <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Your StockSense Password Reset OTP",
    html: otpEmailHtml(code),
    text: otpEmailText(code),
  });

  if (error) {
    console.error(`[StockSense] Resend failed to deliver OTP email to ${to}:`, error);
    throw new Error("EMAIL_DELIVERY_FAILED");
  }
}
