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
