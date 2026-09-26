"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NotificationRow } from "@/components/notification-row";
import { EmptyState } from "@/components/ui";
import {
  markNotificationRead,
  markAllNotificationsRead,
  dismissNotification,
} from "@/lib/actions/notifications";
import type { NotificationItem } from "@/lib/notifications";

export function NotificationsList({ initialItems }: { initialItems: NotificationItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const unreadCount = items.filter((i) => !i.read).length;

  async function handleOpen(item: NotificationItem) {
    setItems((prev) => prev.map((i) => (i.key === item.key ? { ...i, read: true } : i)));
    router.push(item.href);
    await markNotificationRead(item.key);
  }

  async function handleDismiss(e: React.MouseEvent, item: NotificationItem) {
    e.stopPropagation();
    setItems((prev) => prev.filter((i) => i.key !== item.key));
    await dismissNotification(item.key);
  }

  async function handleMarkAllRead() {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    await markAllNotificationsRead();
  }

  if (items.length === 0) {
    return (
      <div className="p-6">
        <EmptyState title="You're all caught up" description="New alerts about stock and operations will show up here." />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <p className="text-sm text-muted">{unreadCount} unread</p>
        <button
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
          className="text-sm font-medium text-accent hover:underline disabled:opacity-40 disabled:no-underline"
        >
          Mark all read
        </button>
      </div>
      {items.map((item) => (
        <NotificationRow key={item.key} item={item} onOpen={handleOpen} onDismiss={handleDismiss} />
      ))}
    </div>
  );
}
