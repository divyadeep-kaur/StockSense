import { SearchIcon } from "@/components/icons";
import { NotificationMenu } from "@/components/notification-menu";
import { ProfileMenu } from "@/components/profile-menu";

export function Topbar({ fullName, email, role }: { fullName: string; email: string; role: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-6 shadow-sm">
      <div className="relative w-full max-w-md">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search products, SKU, or anything..."
          className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <div className="flex items-center gap-4">
        <NotificationMenu />
        <ProfileMenu fullName={fullName} email={email} role={role} />
      </div>
    </header>
  );
}
