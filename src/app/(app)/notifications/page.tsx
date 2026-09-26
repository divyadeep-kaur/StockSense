import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getNotificationsForUser } from "@/lib/notifications";
import { Card } from "@/components/ui";
import { NotificationsList } from "./notifications-list";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { items } = await getNotificationsForUser(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
        <p className="mt-1 text-sm text-muted">Everything relevant to your inventory, in one place.</p>
      </div>

      <Card className="overflow-hidden p-0">
        <NotificationsList initialItems={items} />
      </Card>
    </div>
  );
}
