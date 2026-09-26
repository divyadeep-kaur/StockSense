import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { updateProfile, changePassword } from "@/lib/actions/profile";
import { Card } from "@/components/ui";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">My Profile</h1>
        <p className="mt-1 text-sm text-muted">Manage your account information.</p>
      </div>

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
