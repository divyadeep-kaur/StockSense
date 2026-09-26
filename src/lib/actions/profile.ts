"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { issuePasswordOtp, verifyPasswordOtp } from "@/lib/otp";

export type ProfileFormState = { error?: string; success?: string };

const nameSchema = z.object({
  fullName: z.string().trim().min(2, "Name is too short"),
});

export async function updateProfile(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = nameSchema.safeParse({ fullName: formData.get("fullName") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await prisma.user.update({ where: { id: user.id }, data: { fullName: parsed.data.fullName } });
  revalidatePath("/profile");
  return { success: "Profile updated" };
}

export async function requestPasswordChangeOtp(): Promise<ProfileFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  await issuePasswordOtp(user.id, user.email);
  return { success: `Code sent to ${user.email}` };
}

const passwordSchema = z.object({
  code: z.string().trim().length(6, "Enter the 6-digit code"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function changePassword(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = passwordSchema.safeParse({
    code: formData.get("code"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const valid = await verifyPasswordOtp(user.id, parsed.data.code);
  if (!valid) return { error: "That code is invalid or has expired" };

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: "Password changed" };
}
