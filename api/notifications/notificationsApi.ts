import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import * as DTO from "../../types/api/notifications/notificationsDTO";

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
