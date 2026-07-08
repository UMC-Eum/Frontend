import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteNotification,
  getNotificationChats,
  getNotificationClubs,
  getNotificationHearts,
  getNotifications,
  readAllHeartNotifications,
  readNotification,
} from "@/api/notifications/notificationsApi";
import type { INotification } from "@/types/api/notifications/notificationsDTO";

import { queryKeys } from "./queryKeys";
import { useProtectedQueryEnabled } from "./useProtectedQueryEnabled";

type NotificationPage = { items: INotification[]; nextCursor: string | null };

// 알림 목록 캐시들을 refetch 없이 직접 수정한다(스크롤 위치 유지).
// scope를 넘기면 해당 탭(예: "heart") 목록 캐시만, 없으면 전체 알림 목록을 갱신한다.
function patchNotificationCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  updateItem: (item: INotification) => INotification,
  scope?: NotificationScope,
) {
  queryClient.setQueriesData<InfiniteData<NotificationPage>>(
    {
      predicate: (query) => {
        const key = query.queryKey;
        if (!Array.isArray(key) || key[0] !== "notifications") return false;
        return scope ? key[1] === scope : true;
      },
    },
    (current) =>
      current
        ? {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              items: page.items.map(updateItem),
            })),
          }
        : current,
  );
}

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
    mutationFn: (notificationId: number | string) => readNotification(notificationId),
    // refetch(무효화) 대신 캐시를 직접 갱신해 목록 스크롤이 튀지 않게 한다.
    onMutate: (notificationId) => {
      patchNotificationCaches(queryClient, (item) =>
        String(item.notificationId) === String(notificationId)
          ? { ...item, isRead: true }
          : item,
      );
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
    // 마음 탭 목록 캐시만 직접 갱신해 refetch로 인한 스크롤 튐을 막는다.
    onMutate: () => {
      patchNotificationCaches(
        queryClient,
        (item) => ({ ...item, isRead: true }),
        "heart",
      );
    },
  });
}
