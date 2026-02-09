import { useSearchParams } from "react-router-dom";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import BackButton from "../components/BackButton";
import EmptyNotification from "../components/notification/EmptyNotification";
import LikeOrMessage from "../components/notification/LikeOrMessage";
import NotificationLabel from "../components/notification/NotificationLabel";
import {
  getNotificationHearts,
  getNotificationChats,
  readNotification,
} from "../api/notifications/notificationsApi";
import * as DTO from "../types/api/notifications/notificationsDTO";

export type TabType = "HEART" | "CHAT";

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get("tab") as TabType) || "HEART";

  const setTab = (newTab: TabType) => {
    setSearchParams({ tab: newTab }, { replace: true });
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["notifications", currentTab],
      queryFn: ({ pageParam }) =>
        currentTab === "HEART"
          ? getNotificationHearts({ cursor: pageParam, size: 20 })
          : getNotificationChats({ cursor: pageParam, size: 20 }),
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });
  const { mutate: markAsRead } = useMutation({
    mutationFn: readNotification,
    onMutate: async (notificationId: number) => {
      await queryClient.cancelQueries({
        queryKey: ["notifications", currentTab],
      });
      const previousData = queryClient.getQueryData([
        "notifications",
        currentTab,
      ]);
      queryClient.setQueryData<InfiniteData<DTO.INotificationsGetResponse>>(
        ["notifications", currentTab],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((item) =>
                item.notificationId === notificationId
                  ? { ...item, isRead: true }
                  : item,
              ),
            })),
          };
        },
      );
      return { previousData };
    },
    onError: (__err, __id, context) => {
      queryClient.setQueryData(
        ["notifications", currentTab],
        context?.previousData,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", currentTab],
      });
    },
  });
  const allNotifications = data?.pages.flatMap((page) => page.items) || [];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <BackButton title="알림" />
      <LikeOrMessage tab={currentTab} setTab={setTab} />

      {isLoading ? (
        <div className="flex justify-center mt-20 text-gray-400">
          로딩 중...
        </div>
      ) : allNotifications.length > 0 ? (
        <div className="flex flex-col">
          {allNotifications.map((noti) => (
            <NotificationLabel
              key={noti.notificationId}
              notification={noti}
              onClick={(id) => markAsRead(id)}
            />
          ))}

          {hasNextPage && (
            <div
              onClick={() => fetchNextPage()}
              className="p-4 text-center text-sm text-gray-400 cursor-pointer"
            >
              {isFetchingNextPage ? "더 불러오는 중..." : "더보기"}
            </div>
          )}
        </div>
      ) : (
        <EmptyNotification selected={currentTab} />
      )}
    </div>
  );
};

export default NotificationsPage;
