import axios from "axios";
import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import * as DTO from "../../types/api/chats/chatsDTO";

/** 채팅방 생성 (POST) */
export const createChatRoom = async (body: DTO.IChatsRoomsPostRequest) => {
  const { data } = await api.post<
    ApiSuccessResponse<DTO.IChatsRoomsPostResponse>
  >("/v1/chats/rooms", body);
  return data.success.data;
};

/** 채팅방 목록 조회 (GET) */
export const getChatRooms = async (params: {
  cursor?: string | null;
  size: number;
}) => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.IChatsRoomsGetResponse>
  >("/v1/chats/rooms", { params });
  return data.success.data;
};

/** 특정 채팅방 상세 정보 조회 (GET) */
export const getChatRoomDetail = async (chatRoomId: number) => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.IChatsRoomIdGetResponse>
  >(`/v1/chats/rooms/${chatRoomId}`);
  return data.success.data;
};

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
  >(`/v1/chats/rooms/${chatRoomId}/messages`, { params: requestParams });

  return data.success.data;
};

export const postChatMediaPresign = async (chatRoomId: number, file: File) => {
  let mediaType = "PHOTO";

  if (file.type.startsWith("audio")) {
    mediaType = "AUDIO";
  } else if (file.type.startsWith("video")) {
    mediaType = "VIDEO";
  }

  const payload = {
    type: mediaType,
    fileName: file.name,
    contentType: file.type,
    sizeBytes: file.size,
  };

  const { data } = await api.post<
    ApiSuccessResponse<DTO.IChatsRoomIdMediaPresignPostResponse>
  >(`/v1/chats/rooms/${chatRoomId}/media/presign`, payload);

  return data.success.data;
};
export const uploadChatFileToS3 = async (
  presignData: DTO.IChatsRoomIdMediaPresignPostResponse,
  file: File,
) => {
  const contentType = presignData.requireHeaders?.["Content-Type"] || file.type;
  const response = await axios.put(presignData.uploadUrl, file, {
    headers: {
      "Content-Type": contentType,
    },
  });

  return response;
};

/** 메시지 전송 (POST) */
export const sendChatMessage = async (
  chatRoomId: number,
  body: DTO.IChatsRoomIdMessagesPostRequset,
) => {
  const { data } = await api.post<
    ApiSuccessResponse<DTO.IChatsRoomIdMessagesPostResponse>
  >(`/v1/chats/rooms/${chatRoomId}/messages`, body);
  return data.success.data;
};

/** 메시지 읽음 처리 (PATCH) */
export const readChatMessage = async (messageId: number) => {
  const { data } = await api.patch<ApiSuccessResponse<null>>(
    `/v1/chats/messages/${messageId}/read`,
  );
  return data.success.data;
};

/** 메시지 수정/삭제 등 (PATCH) */
export const patchChatMessage = async (messageId: number) => {
  const { data } = await api.patch<ApiSuccessResponse<null>>(
    `/v1/chats/messages/${messageId}`,
  );
  return data.success.data;
};
