"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

const COLLAPSED_KEY = "stocksense_sidebar_collapsed";

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const [operationsOpen, setOperationsOpen] = useState(pathname.startsWith("/operations"));
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSED_KEY) === "1");
    } catch {
      // ignore — localStorage unavailable (private mode, etc.)
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
      className={`relative flex h-full shrink-0 flex-col rounded-2xl border border-sidebar-border bg-sidebar-bg shadow-[0_8px_30px_-12px_rgba(79,70,229,0.25)] backdrop-blur-xl backdrop-saturate-150 transition-[width] duration-200 ${
        collapsed ? "w-[76px]" : "w-64"
      }`}
    >
      <button
        onClick={toggleCollapsed}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-7 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-surface/80 text-sidebar-foreground shadow-sm backdrop-blur-xl hover:text-sidebar-foreground-active"
      >
        <ChevronRightIcon className={`h-3.5 w-3.5 transition-transform ${collapsed ? "" : "rotate-180"}`} />
      </button>

      <div className={`flex items-center px-5 py-5 ${collapsed ? "justify-center px-0" : ""}`}>
        {collapsed ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M3 7 L12 12 L21 7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M12 12 L12 22" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </span>
        ) : (
          <Logo />
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3">
        <NavLink href="/dashboard" icon={GridIcon} label="Dashboard" active={isActive("/dashboard")} collapsed={collapsed} />
        <NavLink href="/products" icon={BoxIcon} label="Products" active={isActive("/products")} collapsed={collapsed} />

        <div>
          {collapsed ? (
            <Link
              href="/operations/receipts"
              title="Operations"
              className={`flex items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium ${
                isActive("/operations")
                  ? "bg-accent text-white"
                  : "text-sidebar-foreground hover:bg-sidebar-item-active hover:text-sidebar-foreground-active"
              }`}
            >
              <SwapIcon className="h-[18px] w-[18px]" />
            </Link>
          ) : (
            <>
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
            </>
          )}
        </div>

        <NavLink href="/move-history" icon={HistoryIcon} label="Move History" active={isActive("/move-history")} collapsed={collapsed} />
        <NavLink href="/warehouses" icon={WarehouseIcon} label="Warehouses" active={isActive("/warehouses")} collapsed={collapsed} />
        <NavLink href="/settings" icon={SettingsIcon} label="Settings" active={isActive("/settings")} collapsed={collapsed} />
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3">
        <NavLink href="/profile" icon={UserIcon} label={userName} active={isActive("/profile")} collapsed={collapsed} />
        <LogoutButton collapsed={collapsed} />
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
  collapsed,
}: NavItem & { active: boolean; compact?: boolean; collapsed?: boolean }) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-colors ${
        compact ? "py-2" : "py-2.5"
      } ${collapsed ? "justify-center px-0" : "px-3"} ${
        active
          ? "bg-accent text-white"
          : "text-sidebar-foreground hover:bg-sidebar-item-active hover:text-sidebar-foreground-active"
      }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

function LogoutButton({ collapsed }: { collapsed?: boolean }) {
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
        title={collapsed ? "Logout" : undefined}
        className={`flex w-full items-center gap-3 rounded-lg py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-item-active hover:text-sidebar-foreground-active ${
          collapsed ? "justify-center px-0" : "px-3"
        }`}
      >
        <LogoutIcon className="h-[18px] w-[18px]" />
        {!collapsed && "Logout"}
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
