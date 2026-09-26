"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui";
import {
  BoxIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  GridIcon,
  HistoryIcon,
  InboxIcon,
  LogoutIcon,
  SettingsIcon,
  SlidersIcon,
  SwapIcon,
  TransferIcon,
  TruckIcon,
  UserIcon,
  WarehouseIcon,
} from "@/components/icons";

type NavItem = {
  label: string;
  href: string;
  icon: (props: { className?: string }) => React.ReactNode;
};

const OPERATIONS: NavItem[] = [
  { label: "Receipts", href: "/operations/receipts", icon: InboxIcon },
  { label: "Delivery Orders", href: "/operations/deliveries", icon: TruckIcon },
  { label: "Internal Transfers", href: "/operations/transfers", icon: TransferIcon },
  { label: "Adjustments", href: "/operations/adjustments", icon: SlidersIcon },
];

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const [operationsOpen, setOperationsOpen] = useState(pathname.startsWith("/operations"));

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar-bg">
      <div className="px-5 py-5">
        <Logo className="[&_span]:text-sidebar-foreground-active" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        <NavLink href="/dashboard" icon={GridIcon} label="Dashboard" active={isActive("/dashboard")} />
        <NavLink href="/products" icon={BoxIcon} label="Products" active={isActive("/products")} />

        <div>
          <button
            onClick={() => setOperationsOpen((v) => !v)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-item-active hover:text-sidebar-foreground-active"
          >
            <SwapIcon className="h-[18px] w-[18px]" />
            <span className="flex-1 text-left">Operations</span>
            {operationsOpen ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </button>
          {operationsOpen && (
            <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-3">
              {OPERATIONS.map((item) => (
                <NavLink key={item.href} {...item} active={isActive(item.href)} compact />
              ))}
            </div>
          )}
        </div>

        <NavLink href="/move-history" icon={HistoryIcon} label="Move History" active={isActive("/move-history")} />
        <NavLink href="/warehouses" icon={WarehouseIcon} label="Warehouses" active={isActive("/warehouses")} />
        <NavLink href="/settings" icon={SettingsIcon} label="Settings" active={isActive("/settings")} />
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3">
        <NavLink href="/profile" icon={UserIcon} label={userName} active={isActive("/profile")} />
        <LogoutButton />
      </div>
    </aside>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
  active,
  compact,
}: NavItem & { active: boolean; compact?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
        compact ? "py-2" : "py-2.5"
      } ${
        active
          ? "bg-sidebar-item-active text-sidebar-foreground-active"
          : "text-sidebar-foreground hover:bg-sidebar-item-active hover:text-sidebar-foreground-active"
      }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function LogoutButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function confirmLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setConfirming(true)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-item-active hover:text-sidebar-foreground-active"
      >
        <LogoutIcon className="h-[18px] w-[18px]" />
        Logout
      </button>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 text-center shadow-lg">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
              <LogoutIcon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">
              Are you sure you want to logout?
            </h2>
            <p className="mt-1 text-sm text-muted">You&apos;ll need to sign in again to access your account.</p>
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" disabled={loading} onClick={confirmLogout}>
                {loading ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
