import axios from "axios";
import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import * as DTO from "../../types/api/chats/chatsDTO";

export const createChatRoom = async (body: DTO.IChatsRoomsPostRequest) => {
  const { data } = await api.post<
    ApiSuccessResponse<DTO.IChatsRoomsPostResponse>
  >("/v1/chats/rooms", body);
  return data.success.data;
};

export const getChatRooms = async (params: {
  cursor?: string | null;
  size: number;
}) => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.IChatsRoomsGetResponse>
  >("/v1/chats/rooms", { params });
  return data.success.data;
};

export const getChatRoomDetail = async (chatRoomId: number) => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.IChatsRoomIdGetResponse>
  >(`/v1/chats/rooms/${chatRoomId}`);
  return data.success.data;
};

export const getChatMessages = async (
  chatRoomId: number,
  params: { cursor?: string | null; size?: number } = {},
) => {
  const requestParams = { size: 30, ...params };
  const { data } = await api.get<
    ApiSuccessResponse<DTO.IChatsRoomIdMessagesGetResponse>
  >(`/v1/chats/rooms/${chatRoomId}/messages`, { params: requestParams });
  return data.success.data;
};

/** 미디어 업로드 URL 발급 */
export const postChatMediaPresign = async (chatRoomId: number, file: File) => {
  let mediaType = "PHOTO";
  if (file.type.startsWith("audio") || file.type.includes("mp4")) {
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

/** S3 실제 업로드 */
export const uploadChatFileToS3 = async (
  presignData: DTO.IChatsRoomIdMediaPresignPostResponse,
  file: File,
) => {
  // 💡 서버가 URL 발급 시 지정한 Content-Type이 있다면 그것을 우선 사용 (S3 업로드 규칙)
  const contentType = presignData.requireHeaders?.["Content-Type"] || file.type;

  return await axios.put(presignData.uploadUrl, file, {
    headers: { "Content-Type": contentType },
  });
};

export const sendChatMessage = async (
  chatRoomId: number,
  body: DTO.IChatsRoomIdMessagesPostRequset,
) => {
  const { data } = await api.post<
    ApiSuccessResponse<DTO.IChatsRoomIdMessagesPostResponse>
  >(`/v1/chats/rooms/${chatRoomId}/messages`, body);
  return data.success.data;
};

export const readChatMessage = async (messageId: number) => {
  const { data } = await api.patch<ApiSuccessResponse<null>>(
    `/v1/chats/messages/${messageId}/read`,
  );
  return data.success.data;
};

export const patchChatMessage = async (messageId: number) => {
  const { data } = await api.patch<ApiSuccessResponse<null>>(
    `/v1/chats/messages/${messageId}`,
  );
  return data.success.data;
};

export const patchChatRoomLeave = async (chatRoomId: number) => {
  const { data } = await api.patch<ApiSuccessResponse<null>>(
    `/v1/chats/rooms/${chatRoomId}/leave`,
  );
  return data.success.data;
};
