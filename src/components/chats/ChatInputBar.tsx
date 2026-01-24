import { useState, useRef } from "react";
import { useMicRecording } from "../../hooks/useMicRecording"; 
import { ChatPlusMenu } from "./ChatPlusMenu"; 
import RecordingControl from "../RecordingControl"; 

interface ChatInputBarProps {
  onSendText: (text: string) => void;
  onSendVoice: (file: File, duration: number) => void;
}

export function ChatInputBar({ onSendText, onSendVoice }: ChatInputBarProps) {
  const [text, setText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { status, seconds, handleMicClick, isShort } = useMicRecording((file, duration) => {
    onSendVoice(file, duration);
  }, true);

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

  return (
    <div className="relative w-full z-30">
      
      {/* 입력바 영역 (흰색 박스) */}
      {/* relative를 줘서 자식인 마이크가 이 박스를 기준으로 위치를 잡게 함 */}
      <div className="flex flex-col bg-white border-t border-gray-100 pb-safe relative z-20">
        
        {/* 🎤 [수정 완료] 
            absolute: 띄운다
            bottom-full: 내 밑변을 부모(흰박스)의 윗변에 맞춘다 (딱 붙음)
            mb-6: 거기서 24px만큼 더 위로 띄운다
            flex flex-col items-center: 내부 정렬
        */}
        <RecordingControl 
          status={status}
          seconds={seconds}
          isShort={isShort}
          isResultPage={false}
          onMicClick={handleMicClick}
          className="absolute bottom-full mb-6 flex flex-col items-center" 
        />

        {/* ----------------- 기존 입력창 내용 ----------------- */}
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
              placeholder={status === "recording" ? "녹음 중입니다..." : "대화를 입력하세요"}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={handleInputFocus} 
              disabled={status === "recording"}
              onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && handleTextSend()}
            />
          </div>

          {/* 전송 버튼 */}
          {text.length > 0 ? (
            <button onClick={handleTextSend} className="p-2 font-bold text-[#FC3367] text-sm whitespace-nowrap">전송</button>
          ) : (
            <div className="w-[37px] h-[37px] bg-[#E9ECED] rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 22 16" fill="none">
                  <path d="M7.91645 7.652L1.42305 3.05942C0.63275 2.50047 1.01842 1.25681 1.9863 1.24309L19.339 0.996997C20.1755 0.985135 20.6559 1.94432 20.1455 2.60706L9.89652 15.9149C9.32159 16.6614 8.12763 16.2712 8.10455 15.3292L7.91645 7.652ZM7.91645 7.652L11.57 5.81253" stroke="#636970" strokeWidth="1.99387" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
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