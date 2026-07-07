import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  deleteNotification,
  getNotificationChats,
  getNotificationClubs,
  getNotificationHearts,
  getNotifications,
  readAllHeartNotifications,
  readNotification,
} from "@/api/notifications/notificationsApi";

import { queryKeys } from "./queryKeys";
import { useProtectedQueryEnabled } from "./useProtectedQueryEnabled";

const DEFAULT_PAGE_SIZE = 20;
type NotificationScope = "all" | "heart" | "chat" | "club";

const notificationFetchers = {
  all: getNotifications,
  heart: getNotificationHearts,
  chat: getNotificationChats,
  club: getNotificationClubs,
};

export function useNotificationsInfiniteQuery(
  scope: NotificationScope,
  size = DEFAULT_PAGE_SIZE,
  enabled = true,
) {
  const queryEnabled = useProtectedQueryEnabled(enabled);

  return useInfiniteQuery({
    queryKey: queryKeys.notifications.list(scope, size),
    queryFn: ({ pageParam }) =>
      notificationFetchers[scope]({ cursor: pageParam, size }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: queryEnabled,
  });
}

export function useReadNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) => readNotification(notificationId),
    onSuccess: () => {
      // 홈 상단 알림 dot 등 다른 화면의 unread 계산이 즉시 갱신되도록 무효화한다.
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) => deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useReadAllHeartNotificationsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: readAllHeartNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
