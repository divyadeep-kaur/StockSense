import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { updateProfile, changePassword } from "@/lib/actions/profile";
import { Card } from "@/components/ui";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";

const ROLE_LABEL: Record<string, string> = {
  MANAGER: "Inventory Manager",
  STAFF: "Warehouse Staff",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const initial = user.fullName.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">My Profile</h1>
        <p className="mt-1 text-sm text-muted">Manage your account information.</p>
      </div>

      <Card className="flex items-center gap-4 p-6">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-soft text-2xl font-semibold text-accent">
          {initial}
        </span>
        <div>
          <p className="text-lg font-semibold text-foreground">{user.fullName}</p>
          <p className="text-sm text-muted">{ROLE_LABEL[user.role] ?? user.role}</p>
          <p className="mt-1 text-xs text-muted">Member since {formatDate(user.createdAt)}</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-foreground">Profile details</h2>
          <ProfileForm action={updateProfile} fullName={user.fullName} email={user.email} role={user.role} />
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-foreground">Change password</h2>
          <PasswordForm action={changePassword} />
        </Card>
      </div>
    </div>
  );
}
