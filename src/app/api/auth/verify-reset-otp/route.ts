import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPasswordOtp } from "@/lib/otp";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  code: z.string().trim().length(6, "Enter the 6-digit code"),
});

const REASON_MESSAGE: Record<string, string> = {
  invalid: "Invalid OTP",
  expired: "OTP has expired. Please request a new OTP.",
  too_many_attempts: "Too many attempts. Please request a new OTP.",
};

export async function POST(request: Request) {
  if (isRateLimited(`verify-reset-otp:${clientIp(request)}`, 15, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
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

  const { email, code } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: REASON_MESSAGE.invalid }, { status: 400 });
  }

  const result = await verifyPasswordOtp(user.id, code);
  if (!result.ok) {
    return NextResponse.json({ error: REASON_MESSAGE[result.reason] }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
