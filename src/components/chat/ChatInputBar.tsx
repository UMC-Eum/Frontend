import { useState, useRef, useEffect } from "react";
import { useMicRecording } from "../../hooks/useMicRecording";
import { ChatPlusMenu } from "./ChatPlusMenu";
import RecordingControl from "../RecordingControl";

interface ChatInputBarProps {
  onSendText: (text: string) => void;
  onSendVoice: (file: File, duration: number) => void;
  isBlocked?: boolean;
  onSendImage: (file: File) => void;
}

export function ChatInputBar({
  onSendText,
  onSendVoice,
  isBlocked,
  onSendImage,
}: ChatInputBarProps) {
  const [text, setText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);

  const { status, seconds, handleMicClick, isShort } = useMicRecording(
    (file, duration) => {
      onSendVoice(file, duration);
    },
    true,
  );

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

  const handleSend = async () => {
    if (selectedFile) {
      onSendImage(selectedFile);
      handleRemoveFile();
    }

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(url);

    e.target.value = "";
    setIsMenuOpen(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const triggerCamera = () => cameraInputRef.current?.click();
  const triggerAlbum = () => albumInputRef.current?.click();

  const shouldHideMic =
    status === "inactive" &&
    (isMenuOpen || isFocused || text.length > 0 || selectedFile !== null);

  if (isBlocked) {
    return (
      <div className="shrink-0 min-h-[60px] px-4 py-2 bg-white border-t border-gray-100 flex items-center justify-center">
        <div className="flex-1 bg-[#F2F4F6] rounded-[20px] px-4 py-3 text-[14px] text-[#979797]">
          차단한 사용자와는 대화할 수 없어요.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col bg-white border-t border-gray-100 pb-safe relative z-20">
        <div
          className={`absolute bottom-full left-0 right-0 h-[150px] w-full
            bg-gradient-to-t from-white via-white/50 to-transparent
            pointer-events-none z-10
            ${shouldHideMic ? "opacity-0" : "opacity-100"}`}
        />
        <RecordingControl
          status={status}
          seconds={seconds}
          isShort={isShort}
          onMicClick={handleMicClick}
          isChat={true}
          className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-6 flex flex-col items-center transition-opacity duration-200 
            ${shouldHideMic ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"}`}
        />

        {selectedFile && previewUrl && (
          <div className="px-4 pt-3 pb-1 flex">
            <div className="relative inline-block">
              {selectedFile.type.startsWith("video") ? (
                <video
                  src={previewUrl}
                  className="h-20 w-auto rounded-lg border border-gray-200 object-cover"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="preview"
                  className="h-20 w-auto rounded-lg border border-gray-200 object-cover"
                />
              )}
              <button
                onClick={handleRemoveFile}
                className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full p-1"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
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
            className={`p-2 transition-transform ${isMenuOpen ? "rotate-45" : ""}`}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>

          <div className="flex-1 bg-gray-100 rounded-[24px] px-4 py-2.5">
            <input
              ref={inputRef}
              className="w-full bg-transparent outline-none text-[15px]"
              placeholder={
                status === "recording" ? "녹음 중..." : "대화를 입력하세요"
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                if (isComposing || (e.nativeEvent as any).isComposing) return;
                e.preventDefault();
                handleSend();
              }}
            />
          </div>

          {(text.length > 0 || selectedFile) && (
            <button
              onClick={handleSend}
              className="p-2 font-bold text-[#FC3367]"
            >
              전송
            </button>
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
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*,video/*"
        ref={albumInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
