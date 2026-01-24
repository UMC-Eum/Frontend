import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import * as DTO from "../../types/api/chats/chatsDTO";

// --- 1. 채팅방 관련 ---

/** 채팅방 생성 (POST) */
export const createChatRoom = async (body: DTO.IChatsRoomsPostRequest) => {
  const { data } = await api.post<
    ApiSuccessResponse<DTO.IChatsRoomsPostResponse>
  >("/chats/rooms", body);
  return data.success.data;
};

/** 채팅방 목록 조회 (GET) */
export const getChatRooms = async (params: {
  cursor?: string | null;
  size: number;
}) => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.IChatsRoomsGetResponse>
  >("/chats/rooms", { params });
  return data.success.data;
};

/** 특정 채팅방 상세 정보 조회 (GET) */
export const getChatRoomDetail = async (chatRoomId: number) => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.IChatsRoomIdGetResponse>
  >(`/chats/rooms/${chatRoomId}`);
  return data.success.data;
};

// --- 2. 메시지 관련 ---

/** 메시지 목록 조회 (GET) */
export const getChatMessages = async (
  chatRoomId: number,
  params: { cursor?: string | null; size?: number } = {},
) => {
  const requestParams = {
    size: 30,
    ...params,
  };

  const { data } = await api.get<
    ApiSuccessResponse<DTO.IChatsRoomIdMessagesGetResponse>
  >(`/chats/rooms/${chatRoomId}/messages`, { params: requestParams });

  return data.success.data;
};

/** 메시지 전송 (POST) */
export const sendChatMessage = async (
  chatRoomId: number,
  body: DTO.IChatsRoomIdMessagesPostRequset,
) => {
  const { data } = await api.post<
    ApiSuccessResponse<DTO.IChatsRoomIdMessagesPostResponse>
  >(`/chats/rooms/${chatRoomId}/messages`, body);
  return data.success.data;
};

/** 메시지 읽음 처리 (PATCH) */
export const readChatMessage = async (messageId: number) => {
  const { data } = await api.patch<ApiSuccessResponse<null>>(
    `/chats/messages/${messageId}/read`,
  );
  return data.success.data;
};

/** 메시지 수정/삭제 등 (PATCH) */
export const patchChatMessage = async (messageId: number) => {
  const { data } = await api.patch<ApiSuccessResponse<null>>(
    `/chats/messages/${messageId}`,
  );
  return data.success.data;
};