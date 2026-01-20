// card/actions/VoiceAction.tsx
interface VoiceActionProps {
  onVoice?: () => void;
  isPlaying?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap: Record<"sm" | "md" | "lg", string> = {
  sm: "w-[46px] h-[24px]",
  md: "w-[64px] h-[64px] text-xl",
  lg: "w-[88px] h-[88px]",
};

export default function VoiceAction({
  onVoice,
  size = "md",
}: VoiceActionProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onVoice?.();
      }}
    >

      {size === "lg" ?
      <div className={`
        ${sizeMap[size] || sizeMap.lg}
        rounded-full
        bg-white/25 backdrop-blur-sm  
        flex items-center justify-center
        z-50
      `}>
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path d="M6 12H10.0698C10.3509 12 10.6264 11.921 10.8648 11.772L20.205 5.93437C21.2041 5.30995 22.5 6.02822 22.5 7.20637V28.7936C22.5 29.9718 21.2041 30.69 20.205 30.0656L10.8648 24.228C10.6264 24.079 10.3509 24 10.0698 24H6C5.17157 24 4.5 23.3284 4.5 22.5V13.5C4.5 12.6716 5.17157 12 6 12Z" stroke="white" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M25.5 7.98584C30.3807 8.7105 34.126 12.9172 34.126 17.9995C34.126 23.0818 30.3807 27.2885 25.5 28.0132V25.7271C29.1318 25.027 31.876 21.8358 31.876 17.9995C31.876 14.1632 29.1319 10.9701 25.5 10.27V7.98584Z" fill="white"/>
          <path d="M25.5 12.5522C27.8756 13.1881 29.625 15.3552 29.625 17.9312C29.6248 20.507 27.8752 22.6724 25.5 23.3081V20.9155C26.609 20.3787 27.3749 19.2457 27.375 17.9312L27.3711 17.7603C27.3081 16.5183 26.5609 15.4586 25.5 14.9448V12.5522Z" fill="white"/>
        </svg>
      </div> :
      <div className={`
        ${sizeMap[size] || sizeMap.lg}
        rounded-full
        bg-white/25 backdrop-blur-sm  
        flex items-center justify-center
        z-50
      `}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 36 36" fill="none">
          <path d="M6 12H10.0698C10.3509 12 10.6264 11.921 10.8648 11.772L20.205 5.93437C21.2041 5.30995 22.5 6.02822 22.5 7.20637V28.7936C22.5 29.9718 21.2041 30.69 20.205 30.0656L10.8648 24.228C10.6264 24.079 10.3509 24 10.0698 24H6C5.17157 24 4.5 23.3284 4.5 22.5V13.5C4.5 12.6716 5.17157 12 6 12Z" stroke="white" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M25.5 7.98584C30.3807 8.7105 34.126 12.9172 34.126 17.9995C34.126 23.0818 30.3807 27.2885 25.5 28.0132V25.7271C29.1318 25.027 31.876 21.8358 31.876 17.9995C31.876 14.1632 29.1319 10.9701 25.5 10.27V7.98584Z" fill="white"/>
          <path d="M25.5 12.5522C27.8756 13.1881 29.625 15.3552 29.625 17.9312C29.6248 20.507 27.8752 22.6724 25.5 23.3081V20.9155C26.609 20.3787 27.3749 19.2457 27.375 17.9312L27.3711 17.7603C27.3081 16.5183 26.5609 15.4586 25.5 14.9448V12.5522Z" fill="white"/>
        </svg>
      </div>}
    </button>
  );
}
