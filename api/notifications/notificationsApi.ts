import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import * as DTO from "../../types/api/notifications/notificationsDTO";

/** 디바이스 푸시 토큰 등록/갱신 (POST /v1/push-tokens) */
export const registerPushToken = async (body: {
  token: string;
  platform: "IOS" | "ANDROID";
  deviceId: string;
  appVersion: string;
}) => {
  const { data } = await api.post<
    ApiSuccessResponse<{
      tokenId: string;
      platform: "IOS" | "ANDROID";
      lastSeenAt: string;
    }>
  >("/v1/push-tokens", body);
  return data.success.data;
};

/** 현재 디바이스 푸시 토큰 해제 (DELETE /v1/push-tokens/current) */
export const unregisterPushToken = async (token: string) => {
  const { data } = await api.delete<ApiSuccessResponse<Record<string, never>>>(
    "/v1/push-tokens/current",
    { data: { token } },
  );
  return data.success.data;
};

/** 알림 목록 조회 (GET) */
export const getNotifications = async (params: {
  cursor?: string | null;
  size: number;
}) => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.INotificationsGetResponse>
  >("/v1/notifications", { params });
  return data.success.data;
};

/** 알림 읽음 처리 (PATCH) */
export const readNotification = async (notificationId: number) => {
  const { data } = await api.patch<ApiSuccessResponse<null>>(
    `/v1/notifications/${notificationId}/read`,
  );
  return data.success.data;
};
//v1/notifications/hearts(get)
export const getNotificationHearts = async (params: {
  cursor?: string | null;
  size: number;
}) => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.INotificationHeartGetResponse>
  >("/v1/notifications/hearts", { params });
  return data.success.data;
};
//v1/notifications/chats(get)
export const getNotificationChats = async (params: {
  cursor?: string | null;
  size: number;
}) => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.INotificationChatGetResponse>
  >("/v1/notifications/chats", { params });
  return data.success.data;
};
//v1/notifications/clubs(get)
export const getNotificationClubs = async (params: {
  cursor?: string | null;
  size: number;
}) => {
  const { data } = await api.get<
    ApiSuccessResponse<DTO.INotificationClubGetResponse>
  >("/v1/notifications/clubs", { params });
  return data.success.data;
};
//v1/notifications/{notificationId} (delete)
export const deleteNotification = async (notificationId: number) => {
  const { data } = await api.delete<ApiSuccessResponse<null>>(
    `/v1/notifications/${notificationId}`,
  );
  return data.success.data;
};
//v1/notifications/hearts/read (patch)
export const readAllHeartNotifications = async () => {
  const { data } = await api.patch<ApiSuccessResponse<null>>(
    `/v1/notifications/hearts/read`,
  );
  return data.success.data;
};
