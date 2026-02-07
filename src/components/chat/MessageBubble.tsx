import { useEffect, useRef, useState } from "react";
// MessageType 경로는 본인 프로젝트에 맞게 확인해주세요
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
  onDelete 
}: MessageBubbleProps) {
  
  const audioRef = useRef<HTMLAudioElement>(null);
  // ✅ 삭제 오버레이 상태 관리
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlayingProp) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; 
    }
  }, [isPlayingProp]);

  // 재생 버튼 클릭 시 오버레이 뜨지 않게 방지
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onPlay(); 
  };

  // 말풍선 클릭 시 삭제 오버레이 토글
  const handleBubbleClick = () => {
    if (isMe && onDelete && !showOverlay) {
      setShowOverlay(true);
    }
  };

  // 삭제 확인 버튼 클릭
  const handleDeleteConfirm = () => {
    if (onDelete) onDelete();
    setShowOverlay(false);
  };

  return (
    <div className={`flex items-end gap-1 mb-4 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      
      {/* ✅ 수정 포인트: 
        별도의 래퍼 div를 만들지 않고, 
        Text와 Audio 렌더링 부분에 각각 직접 로직을 적용하여 
        flex 레이아웃이 깨지는 것을 막았습니다.
      */}

      {/* 1. 텍스트 메시지 */}
      {type === "TEXT" && content && (
        <div 
          onClick={handleBubbleClick}
          className={`relative px-4 py-2 rounded-[14px] max-w-[75%] text-[15px] leading-relaxed break-words
            ${isMe ? "bg-[#FC3367] text-white" : "bg-[#E9ECED] text-gray-900"}
            ${isMe && onDelete ? "cursor-pointer" : ""}`} // 내꺼면 포인터 커서
        >
          {content}

          {/* 🔴 삭제 오버레이 (텍스트용) */}
          {showOverlay && (<ConfirmModal 
            isOpen={showOverlay}
            title="메시지 삭제"
            description="정말 삭제하시겠습니까?"
            confirmText="삭제"
            cancelText="취소"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setShowOverlay(false)}
          />)}
        </div>
      )}

      {/* 2. 오디오 메시지 */}
      {type === "AUDIO" && audioUrl && (
        <div 
          onClick={handleBubbleClick}
          className={`relative flex items-center gap-3 px-4 py-2 rounded-[14px] min-w-[180px]
            ${isMe ? "bg-[#FC3367] text-white" : "bg-[#E9ECED] text-gray-900"}
            ${isMe && onDelete ? "cursor-pointer" : ""}`}
        >
          
          <audio ref={audioRef} src={audioUrl} onEnded={onPlay} className="hidden" />
          
          <button onClick={handlePlayClick} className="shrink-0 z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center 
              ${isMe ? "bg-white/20 text-white" : "bg-gray-100 text-[#FC3367]"}`}>
              {isPlayingProp ? <span>❚❚</span> : <span>▶</span>}
            </div>
          </button>
          
          <div className="flex items-center gap-[2px] h-4 flex-1 opacity-80">
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`w-[2px] rounded-full ${isMe ? "bg-white" : "bg-gray-400"}`}
                style={{ 
                  height: `${Math.random() * 60 + 40}%`, 
                  animation: isPlayingProp ? "pulse 0.5s infinite" : "none" 
                }} />
            ))}
          </div>
          <span className="text-xs font-medium opacity-90 min-w-[30px] text-right">
            {duration ? `${duration}s` : "0s"}
          </span>

          {/* 🔴 삭제 오버레이 (오디오용) */}
          {showOverlay && (<ConfirmModal 
            isOpen={showOverlay}
            title="음성메세지 삭제"
            description="정말 삭제하시겠습니까?"
            confirmText="삭제"
            cancelText="취소"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setShowOverlay(false)}
          />)}
        </div>
      )}

      {/* 3. 읽음 / 시간 표시 영역 */}
      <div className={`flex flex-col justify-end gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
        
        {/* 읽음 표시 (내 메시지일 때만) */}
        {isMe && (
          <span className="text-[12px] font-medium leading-none">
            {readAt ? (
              <span className="text-[#636970]">읽음</span>
            ) : (
              <span className="text-[#FBC02D]">1</span>
            )}
          </span>
        )}

        {/* 시간 표시 */}
        <span className="text-[12px] text-[#A6AFB6] whitespace-nowrap leading-none pb-[2px]">
          {timestamp}
        </span>

        {/* 🗑️ 기존 '삭제' 텍스트 버튼 제거 완료 */}

      </div>
    </div>
    
  );
}