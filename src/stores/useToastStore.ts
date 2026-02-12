import { create } from 'zustand';

interface ToastState {
  message: string | null;
  type: 'info' | 'success' | 'error' | 'warning'; // 타입 확장 가능
  isVisible: boolean;
  link: string | null; // 클릭 시 이동할 경로 (옵션)

  // 액션
  showToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning', link?: string | null) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: 'info',
  isVisible: false,
  link: null,

  showToast: (message, type = 'info', link = null) => {
    set({ 
      message, 
      type, 
      isVisible: true, 
      link 
    });

    // 3초 뒤에 자동으로 닫기
    setTimeout(() => {
      set({ isVisible: false });
      // 애니메이션 시간을 고려해 데이터 초기화는 약간 늦게 해도 됨
      setTimeout(() => {
        set({ message: null, link: null });
      }, 300); 
    }, 3000);
  },

  hideToast: () => {
    set({ isVisible: false });
  },
}));