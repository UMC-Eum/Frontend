import { useState, useEffect, useRef } from "react";
import { useMicRecording } from "../../hooks/useMicRecording"; 
import { ChatPlusMenu } from "./ChatPlusMenu"; 

interface ChatInputBarProps {
  onSendText: (text: string) => void;
  onSendVoice: (file: File) => void;
}

export function ChatInputBar({ onSendText, onSendVoice }: ChatInputBarProps) {
  const [text, setText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { status, seconds, handleMicClick, isShort } = useMicRecording((file) => {
    onSendVoice(file);
  });

  useEffect(() => {
    if (isShort) alert("10초 이상 녹음해야 전송됩니다! 😅");
  }, [isShort]);

  const handleTextSend = () => {
    if (!text.trim()) return;
    onSendText(text);
    setText("");
  };

  const handlePlusClick = () => {
    setIsMenuOpen((prev) => !prev);
    if (!isMenuOpen) {
      inputRef.current?.blur();
    }
  };

  const handleInputFocus = () => {
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const isRecording = status === "recording";

  return (
    <div className="relative w-full">
      {/* 🎤 1. 플로팅 마이크 버튼 (입력창 위 중앙 정렬) 
        - absolute positioning으로 입력바 위에 띄움 (-top-[70px])
        - 메뉴가 열리든 말든 항상 보임
      */}
      <button 
        onClick={handleMicClick} 
        className={`absolute left-1/2 -translate-x-1/2 -top-[76px] z-30
          w-[56px] h-[56px] bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)]
          flex items-center justify-center transition-all duration-200
          ${isRecording ? "scale-110 ring-4 ring-[#FC3367]/20" : "hover:scale-105 active:scale-95"}
        `}
      >
        {isRecording ? (
           // 녹음 중일 때 (네모 아이콘)
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="7" y="7" width="10" height="10" rx="2" fill="#FC3367"/></svg>
        ) : (
           // 평상시 (마이크 아이콘 - 그라데이션 느낌의 색상 적용)
           <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#mic-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <defs>
               <linearGradient id="mic-gradient" x1="12" y1="1" x2="12" y2="23" gradientUnits="userSpaceOnUse">
                 <stop stopColor="#FF6B6B" />
                 <stop offset="1" stopColor="#FC3367" />
               </linearGradient>
             </defs>
             <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
             <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
             <line x1="12" y1="19" x2="12" y2="23"></line>
             <line x1="8" y1="23" x2="16" y2="23"></line>
           </svg>
        )}
      </button>

      {/* 녹음 시간 표시 (마이크 버튼 바로 위에 표시하거나, 기존처럼 오버레이로 유지) */}
      {isRecording && (
        <div className="absolute left-1/2 -translate-x-1/2 -top-[130px] z-30 pointer-events-none animate-fade-in-up">
           <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-gray-100 flex items-center gap-2">
             <div className="w-2 h-2 bg-[#FC3367] rounded-full animate-pulse" />
             <span className="font-mono font-bold text-[#FC3367] text-sm">
               00:{seconds.toString().padStart(2, '0')}
             </span>
           </div>
        </div>
      )}

      {/* 👇 입력바 영역 (흰색 배경) */}
      <div className="flex flex-col bg-white border-t border-gray-100 pb-safe z-20 relative">
        
        <div className="flex items-center gap-2 px-4 py-3 shrink-0">
          
          {/* (+) 버튼 */}
          <button 
            onClick={handlePlusClick} 
            className={`p-2 transition-transform duration-200 ${isMenuOpen ? "rotate-45 text-gray-800" : "text-gray-400 rotate-0"}`}
          >
            {isMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            )}
          </button>
          
          {/* 텍스트 입력 칸 */}
          <div className="flex-1 bg-gray-100 rounded-[24px] px-4 py-2.5 flex items-center">
            <input 
              ref={inputRef}
              className="w-full bg-transparent outline-none text-[15px] placeholder-gray-400 text-gray-800"
              placeholder={isRecording ? "녹음 중입니다..." : "대화를 입력하세요"}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={handleInputFocus} 
              disabled={isRecording}
              onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && handleTextSend()}
            />
          </div>

          {/* 👉 2. 오른쪽 버튼: 텍스트 유무와 상관없이 항상 '전송' 관련 버튼 배치 
            - 텍스트가 있으면: "전송" 글자
            - 텍스트가 없으면: 종이비행기 아이콘 (기존 마이크 자리 대체)
          */}
          {text.length > 0 ? (
            <button onClick={handleTextSend} className="p-2 font-bold text-[#FC3367] text-sm whitespace-nowrap">전송</button>
          ) : (
            // 텍스트 없을 때 보이는 종이비행기 아이콘 (기능 없음 or 비활성화)
            <button className="p-2 text-gray-400">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          )}
        </div>

        {/* 하단 메뉴 영역 */}
        {isMenuOpen && (
          <ChatPlusMenu 
            onCameraClick={() => console.log("카메라 클릭")} 
            onAlbumClick={() => console.log("앨범 클릭")} 
          />
        )}
      </div>
    </div>
  );
}