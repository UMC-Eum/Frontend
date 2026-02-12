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

  refreshNotifications: async () => {
    try {
      const data = await getNotifications({ size: 10 });
      const items = data?.items || [];

      if (items.length > 0) {
        const latestIdFromServer = items[0].notificationId;
        const currentLastId = get().lastKnownId;

        if (currentLastId === 0) {
          set({ lastKnownId: latestIdFromServer });
        } else if (latestIdFromServer > currentLastId) {
          const newNotifications = items.filter(
            (item) => item.notificationId > currentLastId,
          );

          const newLikeNotification = newNotifications.find(
            (item) => item.type === "HEART",
          );

          if (newLikeNotification) {
            set({
              isModalOpen: true,
              selectedNotificationId: newLikeNotification,
            });
          }

          set({
            hasNewBadge: true,
            lastKnownId: latestIdFromServer,
          });
        }
      }

      set({
        notifications: items,
        nextCursor: data?.nextCursor || null,
        hasUnread: items.some((n) => !n.isRead) || false,
      });
    } catch (error) {
      console.error("[알림 폴링 에러] 서버 통신 실패:", error);
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
