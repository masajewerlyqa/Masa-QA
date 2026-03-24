import { redirect } from "next/navigation";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getNotifications } from "@/lib/notifications";
import { NotificationsList } from "./NotificationsList";
import { NOTIFICATIONS_PAGE_SIZE } from "./constants";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

export default async function NotificationsPage() {
  const language = getServerLanguage();
  const { user } = await getCurrentUserWithProfile();
  if (!user) redirect("/login");

  const initial = await getNotifications(user.id, NOTIFICATIONS_PAGE_SIZE, 0);

  return (
    <div className="max-w-content mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl text-primary font-luxury">{t(language, "account.notifications.title")}</h1>
          <p className="text-masa-gray font-sans mt-1">
            {initial.length === 0
              ? t(language, "account.notifications.noneYet")
              : t(language, "account.notifications.recentHint")}
          </p>
        </div>
      </div>

      <NotificationsList initialNotifications={initial} />
    </div>
  );
}
