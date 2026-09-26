import { BellIcon, SearchIcon } from "@/components/icons";

export function Topbar({ userName }: { userName: string }) {
  const initial = userName.trim().charAt(0).toUpperCase() || "U";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-6">
      <div className="relative w-full max-w-md">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search products, SKU, or anything..."
          className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-muted hover:text-foreground">
          <BellIcon className="h-5 w-5" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
          {initial}
        </div>
      </div>
    </header>
  );
}
