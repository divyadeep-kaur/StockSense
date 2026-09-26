"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { useLogoutConfirm, LogoutConfirmModal } from "@/components/logout-confirm";
import { useMobileSidebar } from "@/components/mobile-sidebar-context";
import {
  BoxIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  GridIcon,
  HistoryIcon,
  InboxIcon,
  KanbanIcon,
  LogoutIcon,
  SettingsIcon,
  SlidersIcon,
  SwapIcon,
  TransferIcon,
  TruckIcon,
  UserIcon,
  WarehouseIcon,
  XIcon,
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
  const { open: mobileOpen, setOpen: setMobileOpen } = useMobileSidebar();
  const [operationsOpen, setOperationsOpen] = useState(pathname.startsWith("/operations"));
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

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
  const effectiveCollapsed = collapsed && !mobileOpen;

  return (
    <>
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}
      <aside
        style={{
          backgroundImage:
            "linear-gradient(rgba(238, 242, 255, 0.82), rgba(238, 242, 255, 0.82)), url(/images/sidebar-bg.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className={`fixed inset-y-3 left-3 z-50 flex w-64 flex-col rounded-2xl border border-sidebar-border shadow-[0_8px_30px_-12px_rgba(79,70,229,0.25)] backdrop-blur-xl backdrop-saturate-150 transition-transform duration-200 lg:static lg:inset-auto lg:z-auto lg:h-full lg:shrink-0 lg:translate-x-0 lg:transition-[width] ${
          mobileOpen ? "translate-x-0" : "-translate-x-[calc(100%+2rem)]"
        } ${collapsed ? "lg:w-[76px]" : "lg:w-64"}`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute -right-3 top-7 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-surface/80 text-sidebar-foreground shadow-sm backdrop-blur-xl hover:text-sidebar-foreground-active lg:hidden"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-7 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-surface/80 text-sidebar-foreground shadow-sm backdrop-blur-xl hover:text-sidebar-foreground-active lg:flex"
        >
          <ChevronRightIcon className={`h-3.5 w-3.5 transition-transform ${collapsed ? "" : "rotate-180"}`} />
        </button>

      <div className={`flex items-center px-5 py-5 ${effectiveCollapsed ? "justify-center px-0" : ""}`}>
        {effectiveCollapsed ? (
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
        <NavLink href="/dashboard" icon={GridIcon} label="Dashboard" active={isActive("/dashboard")} collapsed={effectiveCollapsed} />
        <NavLink href="/products" icon={BoxIcon} label="Products" active={isActive("/products")} collapsed={effectiveCollapsed} />

        <div>
          {effectiveCollapsed ? (
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

        <NavLink href="/move-history" icon={HistoryIcon} label="Move History" active={isActive("/move-history")} collapsed={effectiveCollapsed} />
        <NavLink href="/kanban" icon={KanbanIcon} label="Kanban Board" active={isActive("/kanban")} collapsed={effectiveCollapsed} />
        <NavLink href="/warehouses" icon={WarehouseIcon} label="Warehouses" active={isActive("/warehouses")} collapsed={effectiveCollapsed} />
        <NavLink href="/settings" icon={SettingsIcon} label="Settings" active={isActive("/settings")} collapsed={effectiveCollapsed} />
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3">
        <NavLink href="/profile" icon={UserIcon} label={userName} active={isActive("/profile")} collapsed={effectiveCollapsed} />
        <LogoutButton collapsed={effectiveCollapsed} />
      </div>
      </aside>
    </>
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
  const { confirming, setConfirming, loading, confirmLogout } = useLogoutConfirm();

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

      <LogoutConfirmModal
        confirming={confirming}
        loading={loading}
        onCancel={() => setConfirming(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
}
