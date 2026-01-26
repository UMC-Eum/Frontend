import { create } from "zustand";
import {
  getNotifications,
  readNotification,
} from "../api/notifications/notificationsApi";
import { INotification } from "../types/api/notifications/notificationsDTO";

interface NotificationState {
  notifications: INotification[];
  hasUnread: boolean;
  nextCursor: string | null;

  // 알림 새로고침 (폴링용)
  refreshNotifications: () => Promise<void>;
  // 알림 읽음 처리
  markAsRead: (notificationId: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  hasUnread: false,
  nextCursor: null,

  // 최신 알림 목록을 가져와서 스토어 업데이트
  refreshNotifications: async () => {
    try {
      // 폴링 시에는 최신 10개 정도만 확인
      const data = await getNotifications({ size: 10 });

      set({
        notifications: data.items,
        nextCursor: data.nextCursor,
        // 하나라도 안 읽은 게 있다면 true
        hasUnread: data.items.some((n) => !n.isRead),
      });
    } catch (error) {
      console.error("알림 새로고침 실패:", error);
    }
  },

  // 특정 알림 읽음 처리
  markAsRead: async (notificationId: number) => {
    try {
      await readNotification(notificationId);

      // 서버 응답을 기다리지 않고 로컬 상태를 먼저 변경 (낙관적 업데이트)
      const currentNotifications = get().notifications.map((n) =>
        n.notificationId === notificationId ? { ...n, isRead: true } : n,
      );

      set({
        notifications: currentNotifications,
        hasUnread: currentNotifications.some((n) => !n.isRead),
      });
    } catch (error) {
      console.error("알림 읽음 처리 실패:", error);
    }
  },
}));
