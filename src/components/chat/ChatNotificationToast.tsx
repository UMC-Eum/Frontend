import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import avatar_placeholder from "../../assets/avatar_placeholder.svg";
interface ChatNotificationToastProps {
  isVisible: boolean;
  senderName: string;
  senderProfileImage: string;
  messagePreview: string;
  chatRoomId: number;
  onClose: () => void;
}

export default function ChatNotificationToast({
  isVisible,
  senderName,
  senderProfileImage,
  messagePreview,
  chatRoomId,
  onClose,
}: ChatNotificationToastProps) {
  const navigate = useNavigate();
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  useEffect(() => {
    if (isVisible) {
      setTranslateY(0);
    }
  }, [isVisible]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY;
    if (diff < 0) {
      setTranslateY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (translateY < -50) {
      onClose();
    } else {
      setTranslateY(0);
    }
    setTouchStartY(null);
  };

  const handleClick = () => {
    navigate(`/message/room/${chatRoomId}`);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] flex justify-center pointer-events-none transition-all duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="w-full max-w-[500px] mx-4 mt-4 pointer-events-auto"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: touchStartY === null ? "transform 0.3s ease" : "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <div className="bg-white rounded-[16px] shadow-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-[48px] h-[48px] rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
              <img
                src={senderProfileImage}
                alt={senderName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = avatar_placeholder;
                }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold text-[#202020] mb-1">
                {senderName}
              </div>
              <div className="text-[13px] text-[#636970] truncate">
                {messagePreview}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
