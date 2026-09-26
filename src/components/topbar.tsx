"use client";

import { MenuIcon, SearchIcon } from "@/components/icons";
import { NotificationMenu } from "@/components/notification-menu";
import { ProfileMenu } from "@/components/profile-menu";
import { useMobileSidebar } from "@/components/mobile-sidebar-context";

export function Topbar({ fullName, email, role }: { fullName: string; email: string; role: string }) {
  const { setOpen } = useMobileSidebar();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 shadow-sm sm:gap-4 sm:px-6">
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="shrink-0 text-muted hover:text-foreground lg:hidden"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <div className="relative w-full max-w-md">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search products, SKU, or anything..."
          className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        <NotificationMenu />
        <ProfileMenu fullName={fullName} email={email} role={role} />
      </div>
    </header>
  );
}
