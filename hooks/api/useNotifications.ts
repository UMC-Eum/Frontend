import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  deleteNotification,
  getNotificationChats,
  getNotificationHearts,
  getNotifications,
  readAllHeartNotifications,
  readNotification,
} from "@/api/notifications/notificationsApi";

import { queryKeys } from "./queryKeys";

const DEFAULT_PAGE_SIZE = 20;
type NotificationScope = "all" | "heart" | "chat";

const notificationFetchers = {
  all: getNotifications,
  heart: getNotificationHearts,
  chat: getNotificationChats,
};

export function useNotificationsInfiniteQuery(
  scope: NotificationScope,
  size = DEFAULT_PAGE_SIZE,
) {
  return useInfiniteQuery({
    queryKey: queryKeys.notifications.list(scope, size),
    queryFn: ({ pageParam }) =>
      notificationFetchers[scope]({ cursor: pageParam, size }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useReadNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) => readNotification(notificationId),
    onSuccess: () => {
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
