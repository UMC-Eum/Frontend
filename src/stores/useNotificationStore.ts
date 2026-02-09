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

  isModalOpen: boolean;
  selectedNotificationId: INotification | null;
  closeModal: () => void;

  // 알림 새로고침 (폴링용)
  refreshNotifications: () => Promise<void>;
  // 알림 읽음 처리
  markAsRead: (notificationId: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  hasUnread: false,
  nextCursor: null,
  isModalOpen: false,
  selectedNotificationId: null,
  closeModal: () => set({ isModalOpen: false, selectedNotificationId: null }),

  // 최신 알림 목록을 가져와서 스토어 업데이트
  refreshNotifications: async () => {
    try {
      const data = await getNotifications({ size: 10 });

      // 🔍 서버 응답 전체 구조를 먼저 확인 (items 외에 다른 필드가 있는지)
      console.log("📡 [알림 API 응답 전체]:", data);

      if (data && data.items) {
        if (data.items.length > 0) {
          console.log(
            `✅ [알림 발견] ${data.items.length}개의 알림이 있습니다.`,
            data.items,
          );
        } else {
          console.log(
            "ℹ️ [알림 없음] items 배열이 비어 있습니다. (서버에 생성된 알림이 없음)",
          );
        }
      } else {
        console.log(
          "⚠️ [구조 불일치] data.items를 찾을 수 없습니다. 응답 구조를 확인하세요.",
        );
      }

      // 스토어 상태 업데이트
      set({
        notifications: data?.items || [],
        nextCursor: data?.nextCursor || null,
        hasUnread: data?.items?.some((n) => !n.isRead) || false,
      });
    } catch (error) {
      console.error("❌ [알림 폴링 에러] 서버 통신 실패:", error);
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
