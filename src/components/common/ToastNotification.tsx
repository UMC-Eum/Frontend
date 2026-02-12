import { useEffect } from "react";

interface ToastProps {
  message: string | null;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function ToastNotification({
  message,
  isVisible,
  onClose,
  duration = 2000,
}: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible || !message) return null;

  return (
    <div className="fixed bottom-[180px] left-1/2 -translate-x-1/2 z-[50] animate-fade-in-up">
      <div className="bg-[#FFE2E9] text-[#FF88A6] px-4 py-2 rounded-[7px] text-[14px] font-medium">
        {message}
      </div>
    </div>
  );
}
