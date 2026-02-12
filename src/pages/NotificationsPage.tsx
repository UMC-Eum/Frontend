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
import LoadingPage from "./LoadingPage";
import * as DTO from "../types/api/notifications/notificationsDTO";

export type TabType = "HEART" | "CHAT";

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get("tab") as TabType) || "HEART";

  const setTab = (newTab: TabType) => {
    setSearchParams({ tab: newTab }, { replace: true });
  };

  // 1. 데이터 조회 (Infinite Query)
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["notifications", currentTab],
      queryFn: ({ pageParam }) =>
        currentTab === "HEART"
          ? getNotificationHearts({ cursor: pageParam, size: 20 })
          : getNotificationChats({ cursor: pageParam, size: 20 }),
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchInterval: 1000 * 30,
      staleTime: 1000 * 60 * 3,
      gcTime: 1000 * 60 * 5,
    });

  const allNotifications = data?.pages.flatMap((page) => page.items) || [];

  // 2. 필터링 로직 (HEART와 CHAT만 정확히 매칭)
  const filteredNotifications = allNotifications.filter((noti) => {
    return noti.type === currentTab;
  });

  // 3. 읽음 처리 Mutation
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

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <BackButton title="알림" />
      <LikeOrMessage tab={currentTab} setTab={setTab} />

      {/* 🟢 스크롤이 가능하도록 이 영역을 감싸고 overflow-y-auto를 줍니다. */}
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <LoadingPage />
        ) : filteredNotifications.length > 0 ? (
          <div className="flex flex-col">
            {filteredNotifications.map((noti) => (
              <NotificationLabel
                key={noti.notificationId}
                notification={noti}
                onClick={(id) => markAsRead(id)}
              />
            ))}

            {/* 더보기 버튼 (무한 스크롤 트리거) */}
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
      </main>
    </div>
  );
};

export default NotificationsPage;
