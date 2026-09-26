import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { issuePasswordOtp } from "@/lib/otp";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});

const DELIVERY_FAILED_MESSAGE = "We couldn't send the verification code right now. Please try again.";

export async function POST(request: Request) {
  if (isRateLimited(`forgot-password:${clientIp(request)}`, 8, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Unregistered emails always get the same { ok: true } response, so this
  // endpoint can't be used to enumerate accounts. A genuine delivery failure
  // for a *registered* email is surfaced — that's an explicit product
  // requirement and only reveals anything in the (rare) case the email
  // provider itself is failing, not during normal operation.
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const result = await issuePasswordOtp(user.id, user.email);
  if (!result.sent && result.reason === "delivery_failed") {
    return NextResponse.json({ error: DELIVERY_FAILED_MESSAGE }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
