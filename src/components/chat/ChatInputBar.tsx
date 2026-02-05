import { useState, useRef } from "react";
import { useMicRecording } from "../../hooks/useMicRecording"; 
import { ChatPlusMenu } from "./ChatPlusMenu"; 
import RecordingControl from "../RecordingControl"; 

interface ChatInputBarProps {
  onSendText: (text: string) => void;
  onSendVoice: (file: File, duration: number) => void;
  isBlocked?: boolean;
  // 🔥 [추가] 이미지가 선택되었을 때 부모에게 파일을 전달하는 함수
  //onSendImage: (file: File) => void; 
}

export function ChatInputBar({ onSendText, onSendVoice, isBlocked }: ChatInputBarProps) {
  const [text, setText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // 텍스트 입력 Ref
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 🔥 [추가] 카메라/앨범 실행을 위한 hidden input Refs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);

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

  // 🔥 [추가] 파일 선택 시 처리 핸들러 (카메라/앨범 공통 사용)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 부모 컴포넌트로 파일 전달
    //onSendImage(file);

    // 같은 파일을 다시 선택할 수 있도록 초기화 & 메뉴 닫기
    e.target.value = "";
    setIsMenuOpen(false);
  };

  // 🔥 [추가] 메뉴 버튼 클릭 핸들러
  const triggerCamera = () => {
    console.log("📸 카메라 실행");
    cameraInputRef.current?.click();
  };

  const triggerAlbum = () => {
    console.log("🖼️ 앨범 실행");
    albumInputRef.current?.click();
  };

  // ✅ 차단 상태일 때 보여줄 UI (입력창 덮어쓰기)
  if (isBlocked) {
    return (
      <div className="shrink-0 min-h-[60px] px-4 py-2 bg-white border-t border-gray-100 flex items-center justify-center">
        {/* + 버튼 (비활성화) */}
        <button disabled className="mr-3 p-2 text-gray-300">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5V19M5 12H19" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* 회색 입력바 */}
        <div className="flex-1 bg-[#F2F4F6] rounded-[20px] px-4 py-3 text-[14px] text-[#979797] flex items-center">
          차단한 사용자와는 대화할 수 없어요.
        </div>

        {/* 전송 버튼 (비활성화) */}
        <button disabled className="ml-3 p-2 text-gray-300">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full z-30">
      
      {/* 입력바 영역 */}
      <div className="flex flex-col bg-white border-t border-gray-100 pb-safe relative z-20">
        
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
            onCameraClick={triggerCamera} // 🔥 함수 연결
            onAlbumClick={triggerAlbum}   // 🔥 함수 연결
          />
        )}
      </div>

      {/* 🔥 [추가] 숨겨진 File Inputs */}
      {/* 1. 카메라용 (capture="environment"로 후면 카메라 우선 실행) */}
      <input 
        type="file" 
        id="camera-input"
        accept="image/*" 
        capture="environment"  // 🔥 핵심: 이 속성이 있어야 바로 카메라가 켜짐
        ref={cameraInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
      />

      {/* 2. 앨범용 (capture 속성 없음 -> 갤러리 열림) */}
      <input 
        type="file" 
        id="album-input"
        accept="image/*" 
        // 🔥 여기는 capture를 빼야 앨범 선택창이 뜸
        ref={albumInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
      />
    </div>
  );
}