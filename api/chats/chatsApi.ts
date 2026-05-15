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

  // 💡 1. 순수하게 audio로 시작하는지만 검사하도록 수정 (비디오 업로드 에러 방지)
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

/** S3 실제 업로드 */
export const uploadChatFileToS3 = async (
  presignData: DTO.IChatsRoomIdMediaPresignPostResponse,
  file: File,
) => {
  const contentType =
    presignData.requiredHeaders?.["Content-Type"] || file.type;

  // 💡 3. Axios 대신 브라우저 순정 fetch 사용 (S3 서명 불일치 에러 원천 차단)
  const response = await fetch(presignData.uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": contentType,
    },
  });

  if (!response.ok) {
    throw new Error(
      `S3 업로드 실패: ${response.status} ${response.statusText}`,
    );
  }

  return response;
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
