"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { LogoutIcon } from "@/components/icons";

export function useLogoutConfirm() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function confirmLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return { confirming, setConfirming, loading, confirmLogout };
}

export function LogoutConfirmModal({
  confirming,
  loading,
  onCancel,
  onConfirm,
}: {
  confirming: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!confirming) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 text-center shadow-lg">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
          <LogoutIcon className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-foreground">Are you sure you want to logout?</h2>
        <p className="mt-1 text-sm text-muted">You&apos;ll need to sign in again to access your account.</p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" disabled={loading} onClick={onConfirm}>
            {loading ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </div>
  );
}
