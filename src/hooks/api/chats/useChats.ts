import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import * as api from "../../../api/chats/chatsApi";
import * as DTO from "../../../types/api/chats/chatsDTO";

export const useChat = () => {
  const queryClient = useQueryClient();

  // --- 채팅방 Hooks ---

  const useCreateChatRoom = () =>
    useMutation({
      mutationFn: (body: DTO.IChatsRoomsPostRequest) =>
        api.createChatRoom(body),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["chats", "rooms"] });
      },
    });

  const useChatRooms = (params: { cursor?: string | null; size: number }) =>
    useQuery({
      queryKey: ["chats", "rooms", "list", params],
      queryFn: () => api.getChatRooms(params),
    });

  const useChatRoomDetail = (chatRoomId: number) =>
    useQuery({
      queryKey: ["chats", "rooms", "detail", chatRoomId],
      queryFn: () => api.getChatRoomDetail(chatRoomId),
      enabled: !!chatRoomId, // ID가 있을 때만 실행
    });

  // --- 메시지 Hooks ---

  const useChatMessages = (
    chatRoomId: number,
    params: { cursor?: string | null; size: number }
  ) =>
    useQuery({
      queryKey: ["chats", "rooms", chatRoomId, "messages", params],
      queryFn: () => api.getChatMessages(chatRoomId, params),
      enabled: !!chatRoomId,
    });

  const useSendChatMessage = (chatRoomId: number) =>
    useMutation({
      mutationFn: (body: DTO.IChatsRoomIdMessagesPostRequset) =>
        api.sendChatMessage(chatRoomId, body),
      onSuccess: () => {
        // 메시지를 보냈으니 해당 채팅방의 메시지 목록과 채팅방 리스트(마지막 메시지) 갱신
        queryClient.invalidateQueries({
          queryKey: ["chats", "rooms", chatRoomId, "messages"],
        });
        queryClient.invalidateQueries({ queryKey: ["chats", "rooms", "list"] });
      },
    });

  const useReadMessage = () =>
    useMutation({
      mutationFn: (messageId: number) => api.readChatMessage(messageId),
      onSuccess: () => {
        // 읽음 처리 시 읽음 표시 업데이트를 위해 쿼리 무효화
        queryClient.invalidateQueries({ queryKey: ["chats", "rooms"] });
      },
    });

  return {
    useCreateChatRoom,
    useChatRooms,
    useChatRoomDetail,
    useChatMessages,
    useSendChatMessage,
    useReadMessage,
  };
};
