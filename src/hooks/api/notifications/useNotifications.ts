import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import * as api from "../../../api/notifications/notificationsApi";

export const useNotification = () => {
  const queryClient = useQueryClient();

  /** 알림 목록 조회 훅 */
  const useNotifications = (params: { cursor?: string | null; size: number }) =>
    useQuery({
      queryKey: ["notifications", "list", params],
      queryFn: () => api.getNotifications(params),
    });

  /** 알림 읽음 처리 훅 */
  const useReadNotification = () =>
    useMutation({
      mutationFn: (notificationId: number) =>
        api.readNotification(notificationId),
      onSuccess: () => {
        // 읽음 처리 성공 시 알림 목록 갱신 (빨간 점 제거 등 UI 반영용)
        queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
      },
    });

  return {
    useNotifications,
    useReadNotification,
  };
};
