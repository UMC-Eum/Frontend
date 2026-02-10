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

  // 🔥 [추가] 토스트 알림 상태 (UI용)
  toastMessage: string | null;
  isToastVisible: boolean;
  toastLink: string | null;

  // 🔥 [추가] 토스트 제어 함수
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

  // 🔥 [추가] 토스트 초기값
  toastMessage: null,
  isToastVisible: false,
  toastLink: null,

  closeModal: () => set({ isModalOpen: false, selectedNotificationId: null }),
  clearNewBadge: () => set({ hasNewBadge: false }),

  // 🔥 [추가] 토스트 띄우기 함수
  showToast: (message, link = null) => {
    set({ 
      toastMessage: message, 
      isToastVisible: true, 
      toastLink: link 
    });

    // 3초 뒤 자동 닫기
    setTimeout(() => {
      set({ isToastVisible: false });
      setTimeout(() => {
        set({ toastMessage: null, toastLink: null });
      }, 300); // 애니메이션 시간 고려
    }, 3000);
  },

  hideToast: () => {
    set({ isToastVisible: false });
  },

  // ... (refreshNotifications, markAsRead 등 기존 로직 그대로 유지) ...
  refreshNotifications: async () => { /* 기존 코드 */ },
  markAsRead: async (notificationId: number) => { /* 기존 코드 */ },
}));