interface ChatPlusMenuProps {
  onCameraClick?: () => void;
  onAlbumClick?: () => void;
}

export function ChatPlusMenu({
  onCameraClick,
  onAlbumClick,
}: ChatPlusMenuProps) {
  return (
    <div className="h-[160px] bg-white flex items-start justify-center pt-8 gap-16 animate-fade-in-up">
      <div
        className="flex flex-col items-center gap-2 cursor-pointer"
        onClick={onCameraClick}
      >
        <div className="w-[42px] h-[42px] bg-[#E9ECED] rounded-full flex items-center justify-center transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M14.3486 4C14.9706 4 15.557 4.28967 15.9355 4.7832L17.2305 6.4707H20C21.1046 6.4707 22 7.36613 22 8.4707V18C22 19.1046 21.1046 20 20 20H4C2.96435 20 2.113 19.2128 2.01074 18.2041L2 18V8.4707C2 7.36613 2.89543 6.4707 4 6.4707H6.76953L8.06445 4.7832C8.44295 4.28967 9.02941 4 9.65137 4H14.3486ZM12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9ZM19 9C18.4477 9 18 9.44772 18 10C18 10.5523 18.4477 11 19 11C19.5523 11 20 10.5523 20 10C20 9.44772 19.5523 9 19 9Z"
              fill="#636970"
            />
            <circle cx="12" cy="13" r="2" fill="#636970" />
          </svg>
        </div>
        <span className="text-[14px] text-[#636970] font-medium">카메라</span>
      </div>

      <div
        className="flex flex-col items-center gap-2 cursor-pointer"
        onClick={onAlbumClick}
      >
        <div className="w-[42px] h-[42px] bg-[#E9ECED] rounded-full flex items-center justify-center transition-colors group-hover:bg-[#dce0e2]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M12 0C13.1046 0 14 0.895431 14 2V12C14 13.1046 13.1046 14 12 14H2C0.895431 14 4.83199e-08 13.1046 0 12V2C0 0.895431 0.895431 4.83192e-08 2 0H12ZM5.35254 6C5.08392 6.00011 4.82823 6.10804 4.6416 6.29688L4.56641 6.38281L2.21289 9.38281C1.87214 9.81738 1.94828 10.4463 2.38281 10.7871C2.81738 11.1279 3.4463 11.0517 3.78711 10.6172L5.35254 8.62012L6.91895 10.6172C7.08596 10.8301 7.33241 10.9659 7.60156 10.9941C7.87068 11.0224 8.14006 10.9411 8.34766 10.7676L9.43945 9.85352L10.293 10.707C10.6835 11.0976 11.3165 11.0976 11.707 10.707C12.0976 10.3165 12.0976 9.68349 11.707 9.29297L10.207 7.79297C9.8409 7.42684 9.25566 7.40036 8.8584 7.73242L7.85547 8.57031L6.13965 6.38281C5.95008 6.14118 5.65966 6 5.35254 6ZM9.5 3C8.67157 3 8 3.67157 8 4.5C8 5.32843 8.67157 6 9.5 6C10.3284 6 11 5.32843 11 4.5C11 3.67157 10.3284 3 9.5 3Z"
              fill="#636970"
            />
          </svg>
        </div>
        <span className="text-[14px] text-[#636970] font-medium">앨범</span>
      </div>
    </div>
  );
}
