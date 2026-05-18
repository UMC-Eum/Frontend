import { useMemo } from "react";

import { useChatRoomsInfiniteQuery } from "@/hooks/api/useChats";
import { useReceivedHeartsInfiniteQuery } from "@/hooks/api/useSocials";

const BADGE_QUERY_STALE_TIME = 60_000;

export function useNavbarBadges() {
  const queryOptions = {
    staleTime: BADGE_QUERY_STALE_TIME,
    refetchOnMount: false,
  } as const;
  const receivedHeartsQuery = useReceivedHeartsInfiniteQuery(
    undefined,
    queryOptions,
  );
  const chatRoomsQuery = useChatRoomsInfiniteQuery(undefined, queryOptions);

  const heartCount = useMemo(
    () => {
      const firstPage = receivedHeartsQuery.data?.pages[0];

      return (
        firstPage?.totalCount ??
        receivedHeartsQuery.data?.pages.reduce(
          (total, page) => total + page.items.length,
          0,
        ) ??
        0
      );
    },
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
    hasHeartBadge: heartCount > 0,
    unreadChatCount,
  };
}
