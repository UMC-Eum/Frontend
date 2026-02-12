import { useEffect } from "react";

interface ImageViewerProps {
  src: string;
  onClose: () => void;
}

export default function ImageViewer({ src, onClose }: ImageViewerProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center animate-fade-in touch-none"
      onClick={onClose} 
    >
      {/* 닫기 버튼 */}
      <button 
        onClick={onClose}
        className="absolute top-5 right-5 p-3 text-white/80 hover:text-white"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      {/* 이미지 */}
      <img 
        src={src} 
        alt="Full view" 
        className="max-w-full max-h-full object-contain select-none"
        onClick={(e) => e.stopPropagation()} // 이미지 눌렀을 땐 안 닫히게
      />
    </div>
  );
}