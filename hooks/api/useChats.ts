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
import { IChatsRoomsPostRequest, IChatsRoomIdMessagesPostRequset } from "@/types/api/chats/chatsDTO";

import { queryKeys } from "./queryKeys";
import { useProtectedQueryEnabled } from "./useProtectedQueryEnabled";

const DEFAULT_PAGE_SIZE = 30;

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
  const { enabled = true, ...queryOptions } = options;
  const queryEnabled = useProtectedQueryEnabled(enabled);

  return useInfiniteQuery({
    queryKey: queryKeys.chats.rooms(size),
    queryFn: ({ pageParam }) => getChatRooms({ cursor: pageParam, size }),
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

  return useMutation({
    mutationFn: () => patchChatRoomLeave(chatRoomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.all });
    },
  });
}

function getQueryErrorStatus(error: unknown) {
  const apiError = error as { response?: { status?: number } };
  return apiError.response?.status;
}
