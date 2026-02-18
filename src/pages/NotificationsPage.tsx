import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import BackButton from "../components/BackButton";
import EmptyNotification from "../components/notification/EmptyNotification";
import NotificationLabel from "../components/notification/NotificationLabel";
import {
  getNotificationHearts,
  readNotification,
  readAllHeartNotifications,
} from "../api/notifications/notificationsApi";
import LoadingPage from "./LoadingPage";
import * as DTO from "../types/api/notifications/notificationsDTO";
import { useMemo } from "react"; // useMemo import 확인

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  // 1. 알림 목록 조회
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["notifications", "HEART"],
      queryFn: ({ pageParam }) =>
        getNotificationHearts({ cursor: pageParam, size: 20 }),
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchInterval: 1000 * 30,
      staleTime: 1000 * 60 * 3,
      gcTime: 1000 * 60 * 5,
    });

  // ✅ [수정] ESLint 경고 해결: allNotifications를 useMemo로 감싸서 참조값 고정
  const allNotifications = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) || [];
  }, [data]);

  // [최적화] 읽지 않은 알림 여부 계산 (이제 allNotifications가 안정적이므로 불필요한 재연산 방지됨)
  const hasUnread = useMemo(
    () => allNotifications.some((noti) => !noti.isRead),
    [allNotifications],
  );

  // 2. 단건 읽음 처리 Mutation
  const { mutate: markAsRead } = useMutation({
    mutationFn: readNotification,
    onMutate: async (notificationId: number) => {
      await queryClient.cancelQueries({ queryKey: ["notifications", "HEART"] });
      const previousData = queryClient.getQueryData(["notifications", "HEART"]);

      queryClient.setQueryData<InfiniteData<DTO.INotificationsGetResponse>>(
        ["notifications", "HEART"],
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
        ["notifications", "HEART"],
        context?.previousData,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "HEART"] });
    },
  });

  // 3. 모두 읽음 처리 Mutation
  const { mutate: markAllAsRead } = useMutation({
    mutationFn: readAllHeartNotifications,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications", "HEART"] });
      const previousData = queryClient.getQueryData(["notifications", "HEART"]);

      queryClient.setQueryData<InfiniteData<DTO.INotificationsGetResponse>>(
        ["notifications", "HEART"],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((item) => ({
                ...item,
                isRead: true,
              })),
            })),
          };
        },
      );

      return { previousData };
    },
    onError: (__err, __variables, context) => {
      queryClient.setQueryData(
        ["notifications", "HEART"],
        context?.previousData,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "HEART"] });
    },
  });

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <BackButton title="알림" />

      {/* 탭 디자인 */}
      <div className="border-b border-[#DEE3E5] px-[20px] h-[48px] flex bg-white shrink-0">
        <button
          type="button"
          className="relative flex-1 flex items-center justify-center text-[18px] font-bold text-[#202020]"
        >
          마음
          <div className="absolute bottom-0 left-0 h-[3px] w-full bg-[#FC3367] rounded-full" />
        </button>
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center justify-end gap-3 px-5 py-3 border-b border-gray-50 bg-white z-10 shrink-0">
        <button
          onClick={() => {
            queryClient.invalidateQueries({
              queryKey: ["notifications", "HEART"],
            });
          }}
          className="flex items-center gap-1 text-[13px] font-medium text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
          </svg>
          새로고침
        </button>
        <div className="w-[1px] h-3 bg-gray-200" />

        <button
          onClick={() => {
            if (hasUnread) {
              markAllAsRead();
            }
          }}
          className={`text-[13px] font-medium transition-colors ${
            hasUnread
              ? "text-gray-500 hover:text-[#FF3D77] cursor-pointer"
              : "text-gray-300 cursor-default"
          }`}
        >
          모두 읽음
        </button>
      </div>

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        {isLoading ? (
          <LoadingPage />
        ) : allNotifications.length > 0 ? (
          <div className="flex flex-col">
            {allNotifications.map((noti) => (
              <NotificationLabel
                key={noti.notificationId}
                notification={noti}
                onClick={(id) => {
                  if (noti.isRead) return;
                  markAsRead(id);
                }}
              />
            ))}

            {hasNextPage && (
              <div
                onClick={() => fetchNextPage()}
                className="py-6 text-center text-sm text-gray-400 cursor-pointer hover:text-gray-600"
              >
                {isFetchingNextPage ? (
                  <span className="inline-block animate-pulse">
                    불러오는 중...
                  </span>
                ) : (
                  "더보기"
                )}
              </div>
            )}
            <div className="h-10" />
          </div>
        ) : (
          <EmptyNotification />
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;
