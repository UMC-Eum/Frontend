import React, { useEffect } from "react";

interface ToastProps {
  message: string | null; // 메시지가 있으면 보여주고, 없으면 숨김
  isVisible: boolean;
  onClose: () => void; // 시간이 지나면 닫는 함수
  duration?: number;   // 유지 시간 (기본 2000ms)
}

export default function ToastNotification({ 
  message, 
  isVisible, 
  onClose, 
  duration = 2000 
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
      {/* 핑크색 스타일 유지 */}
      <div className="bg-[#FFE2E9] text-[#FF88A6] px-4 py-2 rounded-[7px] text-[14px] font-medium">
        {message}
      </div>
    </div>
  );
}