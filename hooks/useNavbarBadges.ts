import { useMemo } from "react";

import { useChatRoomsInfiniteQuery } from "@/hooks/api/useChats";
import { useReceivedHeartsInfiniteQuery } from "@/hooks/api/useSocials";

export function useNavbarBadges() {
  const receivedHeartsQuery = useReceivedHeartsInfiniteQuery();
  const chatRoomsQuery = useChatRoomsInfiniteQuery();

  const heartCount = useMemo(
    () =>
      receivedHeartsQuery.data?.pages.reduce(
        (total, page) => total + page.items.length,
        0,
      ) ?? 0,
    [receivedHeartsQuery.data],
  );
  const unreadChatCount = useMemo(
    () =>
      chatRoomsQuery.data?.pages.reduce(
        (total, page) =>
          total +
          page.items.reduce((roomTotal, room) => roomTotal + room.unreadCount, 0),
        0,
      ) ?? 0,
    [chatRoomsQuery.data],
  );

  return {
    hasHeartBadge: heartCount > 0,
    unreadChatCount,
  };
}
