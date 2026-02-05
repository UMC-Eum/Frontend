import { useEffect, useRef } from "react";
// MessageType 경로는 본인 프로젝트에 맞게 확인해주세요
import { MessageType } from "../../types/api/chats/chatsDTO"; 

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
  // 👇 [추가] 삭제 함수 (내가 보낸 메시지일 때만 함수가 들어옴)
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

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlayingProp) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; 
    }
  }, [isPlayingProp]);

  const handlePlayClick = () => {
    onPlay(); 
  };

  return (
    <div className={`flex items-end gap-1 mb-4 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      
      {/* 1. 텍스트 메시지 */}
      {type === "TEXT" && content && (
        <div className={`px-4 py-2 rounded-[14px] max-w-[75%] text-[15px] leading-relaxed break-words
            ${isMe ? "bg-[#FC3367] text-white" : "bg-[#E9ECED] text-gray-900"}`}>
          {content}
        </div>
      )}

      {/* 2. 오디오 메시지 */}
      {type === "AUDIO" && audioUrl && (
        <div className={`flex items-center gap-3 px-4 py-2 rounded-[14px] min-w-[180px]
            ${isMe ? "bg-[#FC3367] text-white" : "bg-[#E9ECED] text-gray-900"}`}>
          
          <audio ref={audioRef} src={audioUrl} onEnded={onPlay} className="hidden" />
          
          <button onClick={handlePlayClick} className="shrink-0">
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
        </div>
      )}

      {/* 3. 읽음 / 시간 / 삭제버튼 영역 */}
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

        {/* 👇 [추가] 삭제 버튼 (isMe이고 onDelete 함수가 있을 때만 표시) */}
        {isMe && onDelete && (
          <button 
            onClick={(e) => {
              e.stopPropagation(); // 버블 클릭 등 다른 이벤트 방지
              onDelete();
            }}
            className="text-[11px] text-gray-400 underline mt-1 hover:text-red-500"
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );
}