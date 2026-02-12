import axios from "axios";
import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import * as DTO from "../../types/api/chats/chatsDTO";

// --- 1. 채팅방 관련 ---

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
  >(`/v1/chats/rooms/${chatRoomId}/messages`, { params: requestParams });

  return data.success.data;
};

/** * 🔥 [신규] 채팅방 전용 미디어 Presign URL 요청
 * 파일 타입에 따라 PHOTO, VIDEO, AUDIO를 동적으로 판별합니다.
 */
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

/** * 🚀 S3 직접 업로드 (PUT)
 * 에러 방지를 위해 requireHeaders가 없을 경우에 대한 방어 로직이 추가되었습니다.
 */
export const uploadChatFileToS3 = async (
  presignData: DTO.IChatsRoomIdMediaPresignPostResponse,
  file: File,
) => {
  // ✅ [수정] Optional Chaining과 기본값 설정을 통해 'Content-Type' 읽기 실패 에러 방지
  const contentType = presignData.requireHeaders?.["Content-Type"] || file.type;

  console.log("📤 S3 업로드 시도 - URL:", presignData.uploadUrl);
  console.log("📤 적용 헤더:", contentType);

  // S3 업로드는 공통 API 인스턴스 대신 순수 axios를 사용합니다.
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
