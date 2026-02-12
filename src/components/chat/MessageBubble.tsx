import { useEffect, useRef, useState } from "react";
import { MessageType } from "../../types/api/chats/chatsDTO";
import ConfirmModal from "../common/ConfirmModal";

interface MessageBubbleProps {
  isMe: boolean;
  type: MessageType;
  content: string | null;
  audioUrl: string | null; 
  duration: number | null;
  timestamp: string;
  readAt: string | null;
  isPlayingProp: boolean;
  onPlay: () => void;
  onDelete?: () => void;
  showTimestamp?: boolean;
  showRead?: boolean;
  onImageClick?: (url: string) => void;
}

export function MessageBubble({
  isMe,
  type,
  content,
  audioUrl,
  duration,
  timestamp,
  readAt,
  isPlayingProp,
  onPlay,
  onDelete,
  showTimestamp = true,
  showRead = true,
  onImageClick,
}: MessageBubbleProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  
  // 롱프레스 타이머 참조
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlayingProp) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isPlayingProp]);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay();
  };

  const handleDeleteConfirm = () => {
    if (onDelete) onDelete();
    setShowOverlay(false);
  };

  // 롱프레스 시작 (누를 때)
  const handlePressStart = () => {
    if (!isMe || !onDelete) return;

    longPressTimer.current = setTimeout(() => {
      setShowOverlay(true);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 2000); 
  };

  // 롱프레스 취소 (뗄 때, 마우스 나갈 때)
  const handlePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div
      className={`flex items-end gap-1 mb-4 ${isMe ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* 1. 텍스트 메시지 */}
      {type === "TEXT" && content && (
        <div
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          className={`relative px-4 py-2 rounded-[14px] max-w-[75%] text-[15px] leading-relaxed break-words select-none
            ${isMe ? "bg-[#FC3367] text-white" : "bg-[#E9ECED] text-gray-900"}
            ${isMe && onDelete ? "cursor-pointer active:scale-95 transition-transform" : ""}`}
        >
          {content}
        </div>
      )}

      {/* 2. 오디오 메시지 */}
      {type === "AUDIO" && audioUrl && (
        <div
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          className={`relative flex items-center gap-3 px-4 py-2 rounded-[14px] min-w-[180px] select-none
            ${isMe ? "bg-[#FC3367] text-white" : "bg-[#E9ECED] text-gray-900"}
            ${isMe && onDelete ? "cursor-pointer" : ""}`}
        >
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={onPlay}
            className="hidden"
          />
          <button onClick={handlePlayClick} className="shrink-0 z-10">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center 
              ${isMe ? "bg-white/20 text-white" : "bg-gray-100 text-[#FC3367]"}`}
            >
              {isPlayingProp ? <span>❚❚</span> : <span>▶</span>}
            </div>
          </button>
          <div className="flex items-center gap-[2px] h-4 flex-1 opacity-80">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`w-[2px] rounded-full ${isMe ? "bg-white" : "bg-gray-400"}`}
                style={{ height: `${Math.random() * 60 + 40}%` }}
              />
            ))}
          </div>
          <span className="text-xs font-medium opacity-90 min-w-[30px] text-right">
            {duration ? `${duration}s` : "0s"}
          </span>
        </div>
      )}

      {/* 3. 이미지 메시지 (PHOTO / IMAGE) */}
      {(type === "PHOTO" || (type as string) === "IMAGE") && audioUrl && (
        <div
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          className={`relative max-w-[70%] rounded-[14px] overflow-hidden border border-gray-100
            ${isMe && onDelete ? "cursor-pointer" : ""}`}
        >
          <img
            src={audioUrl}
            alt="채팅 이미지"
            className="w-full h-auto object-cover block"
            style={{ maxHeight: "300px" }}
            onClick={(e) => {
              if (onImageClick) {
                e.stopPropagation(); 
                onImageClick(audioUrl);
              }
            }}
          />
        </div>
      )}

      {/* 4. 동영상 메시지 (VIDEO) */}
      {(type as string) === "VIDEO" && audioUrl && (
        <div
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          className={`relative max-w-[70%] rounded-[14px] overflow-hidden bg-black
            ${isMe && onDelete ? "cursor-pointer" : ""}`}
        >
          <video src={audioUrl} controls className="w-full h-auto block" />
        </div>
      )}

      {/* 시간 및 읽음 표시 */}
      {(showTimestamp || (isMe && showRead)) && (
        <div
          className={`flex flex-col justify-end gap-0.5 ${isMe ? "items-end" : "items-start"}`}
        >
          {isMe && showRead && (
            <span className="text-[12px] font-medium leading-none">
              {readAt ? (
                <span className="text-[#636970]">읽음</span>
              ) : (
                <span className="text-[#FBC02D]">1</span>
              )}
            </span>
          )}
          {showTimestamp && (
            <span className="text-[12px] text-[#A6AFB6] whitespace-nowrap leading-none pb-[2px]">
              {timestamp}
            </span>
          )}
        </div>
      )}

      {showOverlay && (
        <ConfirmModal
          isOpen={showOverlay}
          title="메시지 삭제"
          description="정말 삭제하시겠습니까?"
          confirmText="삭제"
          cancelText="취소"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowOverlay(false)}
        />
      )}
    </div>
  );
}