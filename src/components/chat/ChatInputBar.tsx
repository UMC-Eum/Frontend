import { useState, useRef, useEffect } from "react"; // useEffect 추가
import { useMicRecording } from "../../hooks/useMicRecording"; 
import { ChatPlusMenu } from "./ChatPlusMenu"; 
import RecordingControl from "../RecordingControl"; 

interface ChatInputBarProps {
  onSendText: (text: string) => void;
  onSendVoice: (file: File, duration: number) => void;
  isBlocked?: boolean;
  onSelectImage: (file: File) => void; 
}

export function ChatInputBar({ 
  onSendText, 
  onSendVoice, 
  isBlocked, 
  onSelectImage 
}: ChatInputBarProps) {
  const [text, setText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // 🔥 [추가] 파일 선택 상태 및 미리보기 URL 관리
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);

  const { status, seconds, handleMicClick, isShort } = useMicRecording((file, duration) => {
    onSendVoice(file, duration);
  }, true);

  // 🔥 [추가] 컴포넌트 언마운트 시 or 파일 변경 시 미리보기 URL 메모리 해제
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleInputFocus = () => {
    setIsFocused(true);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
  };

  // 🔥 [수정] 전송 버튼 클릭 핸들러 (텍스트 or 파일 전송)
  const handleSend = () => {
    // 1. 파일이 있으면 파일 전송
    if (selectedFile) {
      onSelectImage(selectedFile);
      handleRemoveFile(); // 전송 후 미리보기 초기화
    }

    // 2. 텍스트가 있으면 텍스트 전송
    if (text.trim()) {
      onSendText(text);
      setText("");
    }
  };

  const handlePlusClick = () => {
    setIsMenuOpen((prev) => !prev);
    if (!isMenuOpen) {
      inputRef.current?.blur();
    }
  };

  // 🔥 [수정] 파일 선택 시 -> 바로 전송하지 않고 '미리보기 상태'로 저장
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 기존 미리보기 URL 해제 (메모리 누수 방지)
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    // 미리보기 URL 생성
    const url = URL.createObjectURL(file);
    
    setSelectedFile(file);
    setPreviewUrl(url);

    // 초기화 & 메뉴 닫기
    e.target.value = "";
    setIsMenuOpen(false);
  };

  // 🔥 [추가] 미리보기 삭제 (X 버튼)
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const triggerCamera = () => {
    cameraInputRef.current?.click();
  };

  const triggerAlbum = () => {
    albumInputRef.current?.click();
  };

  const shouldHideMic = status === "inactive" && (isMenuOpen || isFocused || text.length > 0 || selectedFile !== null);

  // 차단 상태 UI (기존 동일)
  if (isBlocked) {
    return (
      <div className="shrink-0 min-h-[60px] px-4 py-2 bg-white border-t border-gray-100 flex items-center justify-center">
        <button disabled className="mr-3 p-2 text-gray-300">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5V19M5 12H19" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="flex-1 bg-[#F2F4F6] rounded-[20px] px-4 py-3 text-[14px] text-[#979797] flex items-center">
          차단한 사용자와는 대화할 수 없어요.
        </div>
        <button disabled className="ml-3 p-2 text-gray-300">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col bg-white border-t border-gray-100 pb-safe relative z-20">
        
        <RecordingControl 
          status={status}
          seconds={seconds}
          isShort={isShort}
          isResultPage={false}
          onMicClick={handleMicClick}
          isChat={true}
          className={`absolute bottom-full mb-6 flex flex-col items-center transition-opacity duration-200 
            ${shouldHideMic ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"}`} 
        />

        {/* 🔥 [추가] 파일 미리보기 영역 (파일이 선택되었을 때만 보임) */}
        {selectedFile && previewUrl && (
          <div className="px-4 pt-3 pb-1 flex">
            <div className="relative inline-block">
              {/* 이미지/비디오 구분하여 렌더링 */}
              {selectedFile.type.startsWith('video') ? (
                 <video src={previewUrl} className="h-20 w-auto rounded-lg border border-gray-200 object-cover" />
              ) : (
                 <img src={previewUrl} alt="preview" className="h-20 w-auto rounded-lg border border-gray-200 object-cover" />
              )}
              
              {/* X 버튼 (삭제) */}
              <button 
                onClick={handleRemoveFile}
                className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full p-1 hover:bg-gray-700 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 px-4 py-3 shrink-0">
          
          <button 
            onClick={handlePlusClick} 
            className={`p-2 transition-transform duration-200 ${isMenuOpen ? "rotate-45 text-gray-800" : "text-gray-400 rotate-0"}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
          
          <div className="flex-1 bg-gray-100 rounded-[24px] px-4 py-2.5 flex items-center">
            <input 
              ref={inputRef}
              className="w-full bg-transparent outline-none text-[15px] placeholder-gray-400 text-gray-800"
              placeholder={status === "recording" ? "녹음 중입니다..." : "대화를 입력하세요"}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={handleInputFocus} 
              onBlur={handleInputBlur}
              disabled={status === "recording"}
              // 🔥 [수정] 엔터 키 누르면 handleSend 호출 (파일도 같이 전송되게)
              onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && handleSend()}
            />
          </div>

          {/* 🔥 [수정] 텍스트가 있거나 OR 파일이 선택되었으면 전송 버튼 활성화 */}
          {(text.length > 0 || selectedFile) ? (
            <button onClick={handleSend} className="p-2 font-bold text-[#FC3367] text-sm whitespace-nowrap">전송</button>
          ) : (
            <div className="w-[37px] h-[37px] bg-[#E9ECED] rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 22 16" fill="none">
                  <path d="M7.91645 7.652L1.42305 3.05942C0.63275 2.50047 1.01842 1.25681 1.9863 1.24309L19.339 0.996997C20.1755 0.985135 20.6559 1.94432 20.1455 2.60706L9.89652 15.9149C9.32159 16.6614 8.12763 16.2712 8.10455 15.3292L7.91645 7.652ZM7.91645 7.652L11.57 5.81253" stroke="#636970" strokeWidth="1.99387" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
          )}
        </div>

        {isMenuOpen && (
          <ChatPlusMenu 
            onCameraClick={triggerCamera} 
            onAlbumClick={triggerAlbum}   
          />
        )}
      </div>

      <input 
        type="file" 
        id="camera-input"
        accept="image/*" 
        capture="environment"  
        ref={cameraInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
      />

      <input 
        type="file" 
        id="album-input"
        accept="image/*,video/*" 
        ref={albumInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
      />
    </div>
  );
}