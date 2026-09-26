"use client";

import { XIcon } from "@/components/icons";
import type { NotificationItem, NotificationSeverity } from "@/lib/notifications";

const SEVERITY_DOT: Record<NotificationSeverity, string> = {
  critical: "bg-danger",
  warning: "bg-warning",
  info: "bg-info",
};

export function timeAgo(date: Date | string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationRow({
  item,
  onOpen,
  onDismiss,
  dense,
}: {
  item: NotificationItem;
  onOpen: (item: NotificationItem) => void;
  onDismiss: (e: React.MouseEvent, item: NotificationItem) => void;
  dense?: boolean;
}) {
  return (
    <button
      role="menuitem"
      onClick={() => onOpen(item)}
      className={`group flex w-full items-start gap-3 border-b border-border text-left last:border-b-0 hover:bg-background ${
        dense ? "px-4 py-3" : "px-5 py-4"
      } ${item.read ? "" : "bg-accent-soft/40"}`}
    >
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${SEVERITY_DOT[item.severity]}`} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">{item.title}</span>
        <span className={`block text-xs text-muted ${dense ? "truncate" : ""}`}>{item.message}</span>
        <span className="mt-0.5 block text-[11px] text-muted">{timeAgo(item.date)}</span>
      </span>
      <span
        role="button"
        aria-label="Dismiss notification"
        onClick={(e) => onDismiss(e, item)}
        className="shrink-0 rounded-md p-1 text-muted opacity-0 hover:bg-border/60 hover:text-foreground group-hover:opacity-100"
      >
        <XIcon className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}
