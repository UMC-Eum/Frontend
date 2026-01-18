// src/components/chats/ChatPlusMenu.tsx

interface ChatPlusMenuProps {
  onCameraClick?: () => void;
  onAlbumClick?: () => void;
}

export function ChatPlusMenu({ onCameraClick, onAlbumClick }: ChatPlusMenuProps) {
  return (
    <div className="h-[200px] bg-white flex items-start justify-center pt-8 gap-8 animate-fade-in-up">
      {/* 카메라 버튼 */}
      <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={onCameraClick}>
        <div className="w-[60px] h-[60px] bg-[#F2F4F6] rounded-full flex items-center justify-center text-[#4E5968]">
          {/* 카메라 아이콘 */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
            <circle cx="12" cy="13" r="3"/>
          </svg>
        </div>
        <span className="text-[13px] text-[#4E5968] font-medium">카메라</span>
      </div>

      {/* 앨범 버튼 */}
      <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={onAlbumClick}>
        <div className="w-[60px] h-[60px] bg-[#F2F4F6] rounded-full flex items-center justify-center text-[#4E5968]">
          {/* 앨범 아이콘 */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
        <span className="text-[13px] text-[#4E5968] font-medium">앨범</span>
      </div>
    </div>
  );
}