import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createClubChatRoom,
  createChatRoom,
  getChatMessages,
  getChatRoomDetail,
  getChatRooms,
  patchChatRoomLeave,
  sendChatMessage,
} from "@/api/chats/chatsApi";
import {
  IChatsRoomIdMessagesPostRequset,
  IChatsRoomItem,
  IChatsRoomsGetResponse,
  IChatsRoomsPostRequest,
} from "@/types/api/chats/chatsDTO";
import { useAuthStore } from "@/stores/authStore";

import { queryKeys } from "./queryKeys";
import { useProtectedQueryEnabled } from "./useProtectedQueryEnabled";

const DEFAULT_PAGE_SIZE = 30;
const locallyLeftChatRoomIdsByUser = new Map<number, Set<number>>();

type InfiniteQueryBehaviorOptions = {
  enabled?: boolean;
  staleTime?: number;
  refetchOnMount?: boolean | "always";
  refetchInterval?: number | false;
};

export function useChatRoomsInfiniteQuery(
  size = DEFAULT_PAGE_SIZE,
  options: InfiniteQueryBehaviorOptions = {},
) {
  const queryClient = useQueryClient();
  const myUserId = useAuthStore((state) => state.user?.userId);
  const { enabled = true, ...queryOptions } = options;
  const queryEnabled = useProtectedQueryEnabled(enabled);

  return useInfiniteQuery({
    queryKey: queryKeys.chats.rooms(size),
    queryFn: async ({ pageParam }) => {
      const response = await getChatRooms({ cursor: pageParam, size });
      if (pageParam) return response;

      const previousData = queryClient.getQueryData<InfiniteChatRoomsData>(
        queryKeys.chats.rooms(size),
      );

      return preserveExistingDmRooms(response, previousData?.pages[0], myUserId);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    ...queryOptions,
    enabled: queryEnabled,
  });
}

export function useChatRoomDetailQuery(chatRoomId: number, enabled = true) {
  const queryEnabled = useProtectedQueryEnabled(
    enabled && Number.isFinite(chatRoomId),
  );

  return useQuery({
    queryKey: queryKeys.chats.room(chatRoomId),
    queryFn: () => getChatRoomDetail(chatRoomId),
    enabled: queryEnabled,
  });
}

export function useClubChatRoomQuery(clubId: number, enabled = true) {
  const queryEnabled = useProtectedQueryEnabled(
    enabled && Number.isFinite(clubId),
  );

  return useQuery({
    queryKey: queryKeys.chats.clubRoom(clubId),
    queryFn: () => createClubChatRoom(clubId),
    enabled: queryEnabled,
    retry: (failureCount, error) => {
      const status = getQueryErrorStatus(error);
      if (status === 403 || status === 404) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useChatMessagesInfiniteQuery(
  chatRoomId: number,
  size = DEFAULT_PAGE_SIZE,
  enabled = true,
) {
  const queryEnabled = useProtectedQueryEnabled(
    enabled && Number.isFinite(chatRoomId),
  );

  return useInfiniteQuery({
    queryKey: queryKeys.chats.messages(chatRoomId, size),
    queryFn: ({ pageParam }) =>
      getChatMessages(chatRoomId, { cursor: pageParam, size }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: queryEnabled,
    // 전역 staleTime(1시간)을 따르면 방 재진입 시 옛 메시지가 보이므로 5분으로 유지
    staleTime: 5 * 60_000,
  });
}

export function useCreateChatRoomMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: IChatsRoomsPostRequest) => createChatRoom(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });
    },
  });
}

export function useSendChatMessageMutation(chatRoomId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: IChatsRoomIdMessagesPostRequset) =>
      sendChatMessage(chatRoomId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.messages(chatRoomId, DEFAULT_PAGE_SIZE) });
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.rooms(DEFAULT_PAGE_SIZE) });
    },
  });
}

export function useLeaveChatRoomMutation(chatRoomId: number) {
  const queryClient = useQueryClient();
  const myUserId = useAuthStore((state) => state.user?.userId);

  return useMutation({
    mutationFn: () => patchChatRoomLeave(chatRoomId),
    onSuccess: () => {
      markChatRoomLocallyLeft(myUserId, chatRoomId);
      removeChatRoomFromCache(queryClient, chatRoomId);
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });
    },
  });
}

type InfiniteChatRoomsData = {
  pages: IChatsRoomsGetResponse[];
  pageParams?: unknown[];
};

function preserveExistingDmRooms(
  nextPage: IChatsRoomsGetResponse,
  previousPage?: IChatsRoomsGetResponse,
  userId?: number,
) {
  if (!previousPage?.items?.length) return nextPage;

  const nextIds = new Set(nextPage.items.map((room) => room.chatRoomId));
  const locallyLeftChatRoomIds = getLocallyLeftChatRoomIds(userId);
  const preservedRooms = previousPage.items.filter((room) => {
    if (nextIds.has(room.chatRoomId)) return false;
    if (locallyLeftChatRoomIds.has(room.chatRoomId)) return false;

    return isDmRoom(room);
  });

  if (preservedRooms.length === 0) return nextPage;

  return {
    ...nextPage,
    items: [...nextPage.items, ...preservedRooms],
  };
}

function markChatRoomLocallyLeft(userId: number | undefined, chatRoomId: number) {
  if (typeof userId !== "number") return;

  const existingSet = locallyLeftChatRoomIdsByUser.get(userId) ?? new Set<number>();
  existingSet.add(chatRoomId);
  locallyLeftChatRoomIdsByUser.set(userId, existingSet);
}

function getLocallyLeftChatRoomIds(userId: number | undefined) {
  if (typeof userId !== "number") return new Set<number>();

  return locallyLeftChatRoomIdsByUser.get(userId) ?? new Set<number>();
}

function removeChatRoomFromCache(
  queryClient: ReturnType<typeof useQueryClient>,
  chatRoomId: number,
) {
  queryClient.setQueriesData(
    { queryKey: queryKeys.chats.all },
    (oldData: unknown) => {
      if (!isInfiniteChatRoomsData(oldData)) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          items: page.items.filter((room) => room.chatRoomId !== chatRoomId),
        })),
      };
    },
  );
}

function isDmRoom(room: IChatsRoomItem) {
  return room.type !== "CLUB" && !room.club;
}

function isInfiniteChatRoomsData(data: unknown): data is InfiniteChatRoomsData {
  return (
    typeof data === "object" &&
    data !== null &&
    "pages" in data &&
    Array.isArray((data as InfiniteChatRoomsData).pages)
  );
}

function getQueryErrorStatus(error: unknown) {
  const apiError = error as { response?: { status?: number } };
  return apiError.response?.status;
}
