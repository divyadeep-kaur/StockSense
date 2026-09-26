import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  return transporter;
}

export async function sendOtpEmail(to: string, code: string) {
  const t = getTransporter();

  if (!t) {
    // No SMTP configured for this demo environment — surface the code on the
    // server console so the flow is still testable end to end.
    console.log(`[StockSense] Password reset OTP for ${to}: ${code}`);
    return;
  }

  await t.sendMail({
    from: process.env.SMTP_FROM ?? "StockSense <no-reply@stocksense.local>",
    to,
    subject: "Your StockSense password reset code",
    text: `Your one-time code is ${code}. It expires in 10 minutes.`,
  });
}
