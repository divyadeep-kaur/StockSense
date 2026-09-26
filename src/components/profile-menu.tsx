"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAssistant } from "@/components/assistant-context";
import { useLogoutConfirm, LogoutConfirmModal } from "@/components/logout-confirm";
import { DropdownPortal } from "@/components/dropdown-portal";
import { KanbanIcon, LogoutIcon, SettingsIcon, SparkleIcon, UserIcon } from "@/components/icons";

const ROLE_LABEL: Record<string, string> = {
  MANAGER: "Inventory Manager",
  STAFF: "Warehouse Staff",
};

export function ProfileMenu({
  fullName,
  email,
  role,
}: {
  fullName: string;
  email: string;
  role: string;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { setOpen: setAssistantOpen } = useAssistant();
  const { confirming, setConfirming, loading, confirmLogout } = useLogoutConfirm();

  const initial = fullName.trim().charAt(0).toUpperCase() || "U";

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

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        {initial}
      </button>

      <DropdownPortal anchorRef={buttonRef} open={open} align="right" width={288}>
        <div
          ref={panelRef}
          role="menu"
          className="animate-menu-pop w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
        >
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-base font-semibold text-accent">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{fullName}</p>
              <p className="truncate text-xs text-muted">{email}</p>
              <p className="truncate text-xs text-muted">{ROLE_LABEL[role] ?? role}</p>
            </div>
          </div>

          <div className="border-t border-border py-1.5">
            <MenuLink href="/profile" icon={UserIcon} label="My Profile" onClick={() => setOpen(false)} />
            <MenuLink href="/kanban" icon={KanbanIcon} label="Kanban Board" onClick={() => setOpen(false)} />
            <MenuButton
              icon={SparkleIcon}
              label="Ask StockSense AI"
              onClick={() => {
                setOpen(false);
                setAssistantOpen(true);
              }}
            />
            <MenuLink href="/preferences" icon={SettingsIcon} label="Preferences" onClick={() => setOpen(false)} />
          </div>

          <div className="border-t border-border py-1.5">
            <MenuButton
              icon={LogoutIcon}
              label="Logout"
              danger
              onClick={() => {
                setOpen(false);
                setConfirming(true);
              }}
            />
          </div>
        </div>
      </DropdownPortal>

      <LogoutConfirmModal
        confirming={confirming}
        loading={loading}
        onCancel={() => setConfirming(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: (props: { className?: string }) => React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-foreground hover:bg-background"
    >
      <Icon className="h-4 w-4 text-muted" />
      {label}
    </Link>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: (props: { className?: string }) => React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium hover:bg-background ${
        danger ? "text-danger" : "text-foreground"
      }`}
    >
      <Icon className={`h-4 w-4 ${danger ? "text-danger" : "text-muted"}`} />
      {label}
    </button>
  );
}
