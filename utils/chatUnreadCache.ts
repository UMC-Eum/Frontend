import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/api/queryKeys";
import type { IChatsRoomsGetResponse } from "@/types/api/chats/chatsDTO";

type InfiniteChatRoomsData = {
  pages: IChatsRoomsGetResponse[];
  pageParams?: unknown[];
};

type UnknownRecord = Record<string, unknown>;

export function markChatRoomUnreadCountInCache(
  queryClient: QueryClient,
  chatRoomId: number,
  unreadCount = 0,
) {
  queryClient.setQueriesData(
    { queryKey: queryKeys.chats.all },
    (oldData: unknown) => updateChatRoomsUnreadCount(oldData, chatRoomId, unreadCount),
  );
}

function updateChatRoomsUnreadCount(
  data: unknown,
  chatRoomId: number,
  unreadCount: number,
) {
  if (!isChatRoomsInfiniteData(data)) return data;

  let changed = false;
  let unreadDelta = 0;
  const nextPages = data.pages.map((page) => {
    let pageChanged = false;

    const nextItems = page.items.map((room) => {
      if (room.chatRoomId !== chatRoomId) return room;

      const previousUnreadCount = Math.max(0, room.unreadCount ?? 0);
      const nextUnreadCount = Math.max(0, unreadCount);
      unreadDelta += nextUnreadCount - previousUnreadCount;
      pageChanged = true;
      changed = true;

      return {
        ...room,
        unreadCount: nextUnreadCount,
      };
    });

    if (!pageChanged) return page;

    return {
      ...page,
      items: nextItems,
    };
  });

  if (!changed) return data;

  return {
    ...data,
    pages: nextPages.map((page) => ({
      ...page,
      totalUnreadCount:
        typeof page.totalUnreadCount === "number"
          ? Math.max(0, page.totalUnreadCount + unreadDelta)
          : page.totalUnreadCount,
    })),
  };
}

function isChatRoomsInfiniteData(data: unknown): data is InfiniteChatRoomsData {
  if (!isRecord(data) || !Array.isArray(data.pages)) return false;

  return data.pages.every(
    (page) =>
      isRecord(page) &&
      Array.isArray(page.items) &&
      page.items.every(
        (item) =>
          isRecord(item) &&
          typeof item.chatRoomId === "number" &&
          "unreadCount" in item,
      ),
  );
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}
