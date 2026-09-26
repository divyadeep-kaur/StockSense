"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getNotificationsForUser } from "@/lib/notifications";

export async function getMyNotifications() {
  const user = await getCurrentUser();
  if (!user) return { items: [], unreadCount: 0 };
  return getNotificationsForUser(user.id);
}

export async function markNotificationRead(key: string) {
  const user = await getCurrentUser();
  if (!user) return;

  await prisma.notificationState.upsert({
    where: { userId_key: { userId: user.id, key } },
    update: { read: true },
    create: { userId: user.id, key, read: true },
  });
}

export async function markAllNotificationsRead() {
  const user = await getCurrentUser();
  if (!user) return;

  const { items } = await getNotificationsForUser(user.id);
  await prisma.$transaction(
    items
      .filter((i) => !i.read)
      .map((i) =>
        prisma.notificationState.upsert({
          where: { userId_key: { userId: user.id, key: i.key } },
          update: { read: true },
          create: { userId: user.id, key: i.key, read: true },
        })
      )
  );
}

export async function dismissNotification(key: string) {
  const user = await getCurrentUser();
  if (!user) return;

  await prisma.notificationState.upsert({
    where: { userId_key: { userId: user.id, key } },
    update: { dismissed: true, read: true },
    create: { userId: user.id, key, dismissed: true, read: true },
  });
  revalidatePath("/notifications");
}
