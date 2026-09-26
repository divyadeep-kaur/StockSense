"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BellIcon } from "@/components/icons";
import { NotificationRow } from "@/components/notification-row";
import { DropdownPortal } from "@/components/dropdown-portal";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  dismissNotification,
} from "@/lib/actions/notifications";
import type { NotificationItem } from "@/lib/notifications";

export function NotificationMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  async function refresh() {
    setLoading(true);
    try {
      const data = await getMyNotifications();
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleOpenItem(item: NotificationItem) {
    setItems((prev) => prev.map((i) => (i.key === item.key ? { ...i, read: true } : i)));
    setUnreadCount((c) => Math.max(0, c - (item.read ? 0 : 1)));
    setOpen(false);
    router.push(item.href);
    await markNotificationRead(item.key);
  }

  async function handleDismiss(e: React.MouseEvent, item: NotificationItem) {
    e.stopPropagation();
    setItems((prev) => prev.filter((i) => i.key !== item.key));
    if (!item.read) setUnreadCount((c) => Math.max(0, c - 1));
    await dismissNotification(item.key);
  }

  async function handleMarkAllRead() {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    setUnreadCount(0);
    await markAllNotificationsRead();
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className="relative text-muted hover:text-foreground"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <DropdownPortal anchorRef={buttonRef} open={open} align="right" width={360}>
        <div
          ref={panelRef}
          role="menu"
          className="animate-menu-pop w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="text-xs font-medium text-accent hover:underline disabled:opacity-40 disabled:no-underline"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {loading && items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted">You&apos;re all caught up.</p>
            ) : (
              items.slice(0, 8).map((item) => (
                <NotificationRow key={item.key} item={item} onOpen={handleOpenItem} onDismiss={handleDismiss} dense />
              ))
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-border px-4 py-3 text-center text-sm font-medium text-accent hover:bg-background"
          >
            View all notifications →
          </Link>
        </div>
      </DropdownPortal>
    </>
  );
}
