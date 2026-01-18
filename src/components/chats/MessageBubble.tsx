import { useRef, useState } from "react";
import { MessageType } from "../../types/api/chats/chatsDTO";

interface MessageBubbleProps {
  isMe: boolean;
  type: MessageType;
  content: string | null;
  audioUrl: string | null;
  duration: number | null;
  timestamp: string;
  readAt: string | null; 
}

export function MessageBubble({ isMe, type, content, audioUrl, duration, timestamp, readAt }: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
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
          <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
          
          <button onClick={togglePlay} className="shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center 
              ${isMe ? "bg-white/20 text-white" : "bg-gray-100 text-[#FC3367]"}`}>
              {isPlaying ? <span>❚❚</span> : <span>▶</span>}
            </div>
          </button>
          {/*오디오 파형 눈속임*/}
          <div className="flex items-center gap-[2px] h-4 flex-1 opacity-80">
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`w-[2px] rounded-full ${isMe ? "bg-white" : "bg-gray-400"}`}
                style={{ height: `${Math.random() * 60 + 40}%`, animation: isPlaying ? "pulse 0.5s infinite" : "none" }} />
            ))}
          </div>
          <span className="text-xs font-medium opacity-90 min-w-[30px] text-right">
            {duration ? `${duration}s` : "0s"}
          </span>
        </div>
      )}

      {/* 읽음 처리와 타임스탬프 */}
      <div className={`flex flex-col justify-end gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
        
        {/* 읽음/안읽음 표시 (내가 보낸 메시지일 때만 보임) */}
        {isMe && (
          <span className="text-[12px] font-medium leading-none">
            {readAt ? (
              // 읽었을 때: 사진처럼 회색 "읽음" 텍스트
              <span className="text-[#636970]">읽음</span>
            ) : (
              // 안 읽었을 때: 보통 노란색 숫자 1 또는 "1" 표기 (취향껏 변경 가능)
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