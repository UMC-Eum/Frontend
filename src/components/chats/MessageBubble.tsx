import { useEffect, useRef } from "react";
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
}

export function MessageBubble({ isMe, type, content, audioUrl, duration, timestamp, readAt, isPlayingProp, onPlay }: MessageBubbleProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  // ✅ [핵심] 부모가 준 신호(isPlayingProp)에 따라 오디오를 켜고 끕니다.
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlayingProp) {
      // 부모가 "너 재생해!"(true) 라고 하면 재생
      audioRef.current.play().catch(() => {
        // (가끔 브라우저 정책상 자동재생 막힐 때 예외처리 - 필수는 아님)
      });
    } else {
      // 부모가 "너 꺼져!"(false) 라고 하면 정지 및 되감기
      audioRef.current.pause();
      audioRef.current.currentTime = 0; 
    }
  }, [isPlayingProp]);

  // ✅ 버튼을 누르면 직접 재생하지 않고 "부모님, 저 눌렸어요!"라고 보고만 함
  const handlePlayClick = () => {
    onPlay(); 
  };

  return (
    <div className={`flex items-end gap-1 mb-4 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      
      {/* 텍스트 메시지 */}
      {type === "TEXT" && content && (
        <div className={`px-4 py-2 rounded-[14px] max-w-[75%] text-[15px] leading-relaxed break-words
            ${isMe ? "bg-[#FC3367] text-white" : "bg-[#E9ECED] text-gray-900"}`}>
          {content}
        </div>
      )}

      {/* 오디오 메시지 */}
      {type === "AUDIO" && audioUrl && (
        <div className={`flex items-center gap-3 px-4 py-2 rounded-[14px] min-w-[180px]
            ${isMe ? "bg-[#FC3367] text-white" : "bg-[#E9ECED] text-gray-900"}`}>
          
          {/* onEnded: 재생 끝나면 onPlay를 호출 -> 부모가 토글해서 멈춤 상태로 만듦 */}
          <audio ref={audioRef} src={audioUrl} onEnded={onPlay} className="hidden" />
          
          <button onClick={handlePlayClick} className="shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center 
              ${isMe ? "bg-white/20 text-white" : "bg-gray-100 text-[#FC3367]"}`}>
              {/* 내 상태(isPlayingProp)에 따라 아이콘 변경 */}
              {isPlayingProp ? <span>❚❚</span> : <span>▶</span>}
            </div>
          </button>
          
          {/* 오디오 파형 눈속임 */}
          <div className="flex items-center gap-[2px] h-4 flex-1 opacity-80">
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`w-[2px] rounded-full ${isMe ? "bg-white" : "bg-gray-400"}`}
                style={{ 
                  height: `${Math.random() * 60 + 40}%`, 
                  // 내 상태(isPlayingProp)에 따라 애니메이션 작동
                  animation: isPlayingProp ? "pulse 0.5s infinite" : "none" 
                }} />
            ))}
          </div>
          <span className="text-xs font-medium opacity-90 min-w-[30px] text-right">
            {duration ? `${duration}s` : "0s"}
          </span>
        </div>
      )}

      {/* 읽음 처리와 타임스탬프 */}
      <div className={`flex flex-col justify-end gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
        
        {/* 읽음/안읽음 표시 */}
        {isMe && (
          <span className="text-[12px] font-medium leading-none">
            {readAt ? (
              <span className="text-[#636970]">읽음</span>
            ) : (
              <span className="text-[#FBC02D]">1</span>
            )}
          </span>
        )}

        {/* 시간 */}
        <span className="text-[12px] text-[#A6AFB6] whitespace-nowrap leading-none pb-[2px]">
          {timestamp}
        </span>
      </div>
    </div>
  );
}