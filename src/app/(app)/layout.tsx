import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { AssistantWidget } from "@/components/assistant-widget";
import { AssistantProvider } from "@/components/assistant-context";
import { MobileSidebarProvider } from "@/components/mobile-sidebar-context";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    // The session cookie exists but no longer points to a real user (e.g. it
    // predates a dev database reset). Cookies can't be cleared from a Server
    // Component, so route through a handler that clears it before redirecting —
    // otherwise the proxy just bounces this request straight back here.
    redirect("/api/auth/clear-session");
  }

  return (
    <AssistantProvider>
      <MobileSidebarProvider>
        <div className="flex h-screen gap-3 overflow-hidden p-3 lg:p-3">
          <Sidebar userName={user.fullName} />
          <div className="flex flex-1 flex-col gap-3 overflow-hidden">
            <Topbar fullName={user.fullName} email={user.email} role={user.role} />
            <main className="flex-1 overflow-y-auto rounded-2xl px-4 py-4 sm:px-6 sm:py-6">{children}</main>
          </div>
          <AssistantWidget />
        </div>
      </MobileSidebarProvider>
    </AssistantProvider>
  );
}
