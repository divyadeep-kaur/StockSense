import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { consumeVerifiedOtp } from "@/lib/otp";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

const schema = z
  .object({
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must include a lowercase letter")
      .regex(/[A-Z]/, "Password must include an uppercase letter")
      .regex(/[^a-zA-Z0-9]/, "Password must include a special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const VERIFICATION_EXPIRED = "Your verification has expired. Please start over.";

export async function POST(request: Request) {
  if (isRateLimited(`reset-password:${clientIp(request)}`, 10, 15 * 60 * 1000)) {
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

  const { email, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: VERIFICATION_EXPIRED }, { status: 400 });
  }

  const verified = await consumeVerifiedOtp(user.id);
  if (!verified) {
    return NextResponse.json({ error: VERIFICATION_EXPIRED }, { status: 400 });
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return NextResponse.json({ ok: true });
}
