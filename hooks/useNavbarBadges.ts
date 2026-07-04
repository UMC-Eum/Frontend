import { useMemo } from "react";

import { useChatRoomsInfiniteQuery } from "@/hooks/api/useChats";
import { useReceivedHeartsInfiniteQuery } from "@/hooks/api/useSocials";
import { useHeartBadgeStore } from "@/stores/heartBadgeStore";

export function useNavbarBadges() {
  const queryOptions = {
    staleTime: 0,
    refetchInterval: 2500,
    refetchOnMount: false,
  } as const;
  const receivedHeartsQuery = useReceivedHeartsInfiniteQuery(
    undefined,
    queryOptions,
  );
  const chatRoomsQuery = useChatRoomsInfiniteQuery(undefined, queryOptions);

  const lastSeenHeartId = useHeartBadgeStore((state) => state.lastSeenHeartId);
  const hasHydratedHeartBadge = useHeartBadgeStore((state) => state.hasHydrated);
  const latestHeartId = useMemo(
    () =>
      receivedHeartsQuery.data?.pages.reduce(
        (max, page) =>
          page.items.reduce((pageMax, item) => Math.max(pageMax, item.heartId), max),
        0,
      ) ?? 0,
    [receivedHeartsQuery.data],
  );
  const unreadChatCount = useMemo(
    () => {
      const firstPage = chatRoomsQuery.data?.pages[0];

      return (
        firstPage?.totalUnreadCount ??
        chatRoomsQuery.data?.pages.reduce(
          (total, page) =>
            total +
            page.items.reduce(
              (roomTotal, room) => roomTotal + room.unreadCount,
              0,
            ),
          0,
        ) ??
        0
      );
    },
    [chatRoomsQuery.data],
  );

  return {
    // 마음함에서 아직 확인하지 않은 새 마음이 있을 때만 dot을 켠다.
    // 저장소 복원 전에는 lastSeenHeartId가 0이라 dot이 잘못 깜빡일 수 있어 보류한다.
    hasHeartBadge: hasHydratedHeartBadge && latestHeartId > lastSeenHeartId,
    unreadChatCount,
  };
}
