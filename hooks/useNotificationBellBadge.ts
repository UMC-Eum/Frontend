import { useMemo } from "react";

import { useNotificationsInfiniteQuery } from "@/hooks/api/useNotifications";
import { useAuthStore } from "@/stores/authStore";
import type { INotification } from "@/types/api/notifications/notificationsDTO";

export function useNotificationBellBadge() {
  const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const enabled = isAuthInitialized && isAuthenticated;
  const heartQuery = useNotificationsInfiniteQuery("heart", undefined, enabled);
  const clubQuery = useNotificationsInfiniteQuery("club", undefined, enabled);

  const refetchNotificationBadge = () =>
    Promise.all([heartQuery.refetch(), clubQuery.refetch()]);

  const hasNotificationBadge = useMemo(
    () =>
      enabled &&
      [heartQuery.data, clubQuery.data].some((data) =>
        data?.pages.some((page) => page.items.some(isUnreadNotification)),
      ),
    [enabled, heartQuery.data, clubQuery.data],
  );

  return {
    hasNotificationBadge,
    refetchNotificationBadge,
  };
}

function isUnreadNotification(notification: INotification) {
  if (typeof notification.isRead === "boolean") return !notification.isRead;
  return false;
}
