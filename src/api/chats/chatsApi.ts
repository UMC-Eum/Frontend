import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import * as DTO from "../../types/api/chats/chatsDTO";
import { uploadFileToS3 as onboardingUploadFileToS3 } from "../onboarding/onboardingApi";

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

/** * 🔥 [최종 해결 버전] presign URL 요청
 * 백엔드 스웨거 규격에 맞춰 필드명을 'purpose'로 유지하고,
 * 오디오의 경우 'PROFILE_INTRO_AUDIO' 값을 사용하여 422 에러를 방지합니다.
 */
export const postChatPresign = async (
  fileName: string,
  contentType: string,
) => {
  // 1. 기본값을 PROFILE_IMAGE로 변경 시도
  let purpose = "PROFILE_IMAGE";

  if (contentType.startsWith("audio")) {
    purpose = "PROFILE_INTRO_AUDIO"; // 오디오는 검증 완료된 값
  } else if (contentType.startsWith("video")) {
    purpose = "VIDEO"; // 비디오는 필요시 확인
  } else if (contentType.startsWith("image")) {
    // 🔍 후보 1: "PROFILE_IMAGE" (가장 유력)
    // 🔍 후보 2: "MATCH_CHAT_IMAGE"
    // 🔍 후보 3: "PHOTO"
    purpose = "PROFILE_IMAGE";
  }

  console.log(`📤 사진 Presign 요청: fileName=${fileName}, purpose=${purpose}`);

  const { data } = await api.post<ApiSuccessResponse<any>>(
    "/v1/files/presign",
    {
      fileName,
      contentType,
      purpose,
    },
  );

  return data.success.data;
};

/** * S3 직접 업로드 (PUT)
 * onboardingApi의 로직을 그대로 재사용합니다.
 */
export const uploadFileToS3 = onboardingUploadFileToS3;

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
