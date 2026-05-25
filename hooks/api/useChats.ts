import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createChatRoom,
  getChatMessages,
  getChatRoomDetail,
  getChatRooms,
  patchChatRoomLeave,
  readChatMessage,
  sendChatMessage,
} from "@/api/chats/chatsApi";
import { IChatsRoomsPostRequest, IChatsRoomIdMessagesPostRequset } from "@/types/api/chats/chatsDTO";

import { queryKeys } from "./queryKeys";

const DEFAULT_PAGE_SIZE = 30;

type InfiniteQueryBehaviorOptions = {
  staleTime?: number;
  refetchOnMount?: boolean | "always";
};

export function useChatRoomsInfiniteQuery(
  size = DEFAULT_PAGE_SIZE,
  options: InfiniteQueryBehaviorOptions = {},
) {
  return useInfiniteQuery({
    queryKey: queryKeys.chats.rooms(size),
    queryFn: ({ pageParam }) => getChatRooms({ cursor: pageParam, size }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    ...options,
  });
}

export function useChatRoomDetailQuery(chatRoomId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.chats.room(chatRoomId),
    queryFn: () => getChatRoomDetail(chatRoomId),
    enabled: enabled && Number.isFinite(chatRoomId),
  });
}

export function useChatMessagesInfiniteQuery(
  chatRoomId: number,
  size = DEFAULT_PAGE_SIZE,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: queryKeys.chats.messages(chatRoomId, size),
    queryFn: ({ pageParam }) =>
      getChatMessages(chatRoomId, { cursor: pageParam, size }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: enabled && Number.isFinite(chatRoomId),
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

export function useReadChatMessageMutation() {
  return useMutation({
    mutationFn: (messageId: number) => readChatMessage(messageId),
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
