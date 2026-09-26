import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { issuePasswordOtp } from "@/lib/otp";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});

export async function POST(request: Request) {
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

  // Always respond the same way so this endpoint can't be used to enumerate
  // registered emails — a delivery failure below is logged, not surfaced,
  // for the same reason.
  if (user) {
    try {
      await issuePasswordOtp(user.id, user.email);
    } catch (err) {
      console.error(`[StockSense] Failed to send OTP email to ${user.email}:`, err);
    }
  }

  return NextResponse.json({ ok: true });
}
