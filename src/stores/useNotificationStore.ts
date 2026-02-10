import { create } from "zustand";
import {
  getNotifications,
  readNotification,
} from "../api/notifications/notificationsApi";
import { INotification } from "../types/api/notifications/notificationsDTO";

interface NotificationState {
  notifications: INotification[];
  hasUnread: boolean; // (서버 데이터 기준) 읽지 않은 알림이 있는지
  nextCursor: string | null;

  // 🔔 [추가] 폴링을 위한 상태
  lastKnownId: number; // 마지막으로 확인한 가장 최신 알림 ID
  hasNewBadge: boolean; // 폴링으로 새 알림을 감지했는지 (빨간 점 표시용)
  clearNewBadge: () => void; // 배지 초기화 함수

  isModalOpen: boolean;
  selectedNotificationId: INotification | null;
  closeModal: () => void;

  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  hasUnread: false,
  nextCursor: null,

  // 초기 상태
  lastKnownId: 0,
  hasNewBadge: false,
  isModalOpen: false,
  selectedNotificationId: null,

  closeModal: () => set({ isModalOpen: false, selectedNotificationId: null }),

  // 알림 페이지에 들어갔을 때 배지를 지워주는 함수
  clearNewBadge: () => set({ hasNewBadge: false }),

  // ✅ [핵심] 알림 새로고침 (ID 비교 로직 포함)
  refreshNotifications: async () => {
    try {
      // 1. 서버에서 최신 데이터 가져오기
      const data = await getNotifications({ size: 10 });
      const items = data?.items || [];

      if (items.length > 0) {
        // 서버에서 온 가장 최신 알림의 ID
        // (주의: API 응답 키값이 notificationId 인지 id 인지 확인 필요. 여기선 notificationId 기준)
        const latestIdFromServer = items[0].notificationId;
        const currentLastId = get().lastKnownId;

        // 2. ID 비교 로직
        // Case A: 앱 켜고 처음 로딩할 때 (기준점 잡기)
        if (currentLastId === 0) {
          set({ lastKnownId: latestIdFromServer });
        }
        // Case B: 내가 알던 ID보다 더 큰 ID가 서버에서 옴 -> "새 알림이다!"
        else if (latestIdFromServer > currentLastId) {
          console.log(`🔔 [새 알림 감지] ID: ${latestIdFromServer}`);
          set({
            hasNewBadge: true,
            lastKnownId: latestIdFromServer, // 최신 ID 갱신
          });
        }
      }

      // 3. 스토어 데이터 업데이트 (항상 최신화)
      set({
        notifications: items,
        nextCursor: data?.nextCursor || null,
        hasUnread: items.some((n) => !n.isRead) || false,
      });
    } catch (error) {
      console.error("❌ [알림 폴링 에러] 서버 통신 실패:", error);
    }
  },

  // 읽음 처리 (낙관적 업데이트)
  markAsRead: async (notificationId: number) => {
    try {
      await readNotification(notificationId);

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
