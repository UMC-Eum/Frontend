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

  // 폴링 관련
  lastKnownId: number;
  hasNewBadge: boolean;
  clearNewBadge: () => void;

  // 모달 관련
  isModalOpen: boolean;
  selectedNotificationId: INotification | null;
  closeModal: () => void;

  // 토스트 관련
  toastMessage: string | null;
  isToastVisible: boolean;
  toastLink: string | null;
  showToast: (message: string, link?: string | null) => void;
  hideToast: () => void;

  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  hasUnread: false,
  nextCursor: null,

  lastKnownId: 0,
  hasNewBadge: false,
  isModalOpen: false,
  selectedNotificationId: null,

  toastMessage: null,
  isToastVisible: false,
  toastLink: null,

  closeModal: () => set({ isModalOpen: false, selectedNotificationId: null }),
  clearNewBadge: () => set({ hasNewBadge: false }),

  showToast: (message, link = null) => {
    set({ toastMessage: message, isToastVisible: true, toastLink: link });
    setTimeout(() => {
      set({ isToastVisible: false });
      setTimeout(() => set({ toastMessage: null, toastLink: null }), 300);
    }, 3000);
  },

  hideToast: () => set({ isToastVisible: false }),

  // ✅ [핵심 수정] 폴링 시 좋아요 감지 로직 추가
  refreshNotifications: async () => {
    try {
      // 1. 서버에서 최신 데이터 가져오기
      const data = await getNotifications({ size: 10 });
      const items = data?.items || [];

      if (items.length > 0) {
        const latestIdFromServer = items[0].notificationId;
        const currentLastId = get().lastKnownId;

        // Case A: 앱 처음 켰을 때 (기준점 잡기)
        if (currentLastId === 0) {
          set({ lastKnownId: latestIdFromServer });
        }
        // Case B: 새로운 알림이 감지되었을 때
        else if (latestIdFromServer > currentLastId) {
          console.log(`🔔 [새 알림 감지] ID: ${latestIdFromServer}`);

          // 🔥 [추가 로직] 새로 들어온 알림들 중 'LIKE' 타입이 있는지 찾기
          // (currentLastId보다 큰 ID를 가진 알림들만 필터링)
          const newNotifications = items.filter(
            (item) => item.notificationId > currentLastId,
          );

          // 'LIKE' 타입인 알림 찾기 (백엔드 타입이 'LIKE'인지 'MATCH'인지 확인 필요)
          const newLikeNotification = newNotifications.find(
            (item) => item.type === "HEART", // ⚠️ 백엔드 DTO 타입 확인 필수
          );

          if (newLikeNotification) {
            console.log("💖 새로운 좋아요 발견! 모달 오픈");
            set({
              isModalOpen: true,
              selectedNotificationId: newLikeNotification, // 모달에 데이터 전달
            });
          }

          // 배지 및 ID 업데이트
          set({
            hasNewBadge: true,
            lastKnownId: latestIdFromServer,
          });
        }
      }

      // 3. 목록 업데이트
      set({
        notifications: items,
        nextCursor: data?.nextCursor || null,
        hasUnread: items.some((n) => !n.isRead) || false,
      });
    } catch (error) {
      console.error("❌ [알림 폴링 에러] 서버 통신 실패:", error);
    }
  },

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
