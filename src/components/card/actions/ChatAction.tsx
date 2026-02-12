interface ChatActionProps {
  onChat: () => void;
  size?: "sm" | "md" | "lg";
  mode?: "icon" | "box";
  label?: string;
  disabled?: boolean;
}

export function ChatAction({
  onChat,
  size = "md",
  mode = "icon",
  label,
  disabled = false,
}: ChatActionProps) {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-[64px] h-[64px]",
    lg: "w-[80px] h-[80px]",
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChat();
  };

  return (
    <>
      {mode === "icon" ? (
        <button
          onClick={handleClick}
          disabled={disabled}
          className={`
            ${sizeMap[size] || sizeMap.lg}
            rounded-full
            bg-white/25 backdrop-blur-sm  
            flex items-center justify-center
            z-50
            transition-transform 
            ${disabled && "opacity-50 cursor-not-allowed"} 
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="31"
            viewBox="0 0 32 31"
            fill="none"
          >
            <g clipPath="url(#clip0_chat_action)">
              <path
                d="M11.5127 18.3612L4.34187 13.4479C3.28907 12.7266 3.77177 11.1201 5.04657 11.1026L24.4948 10.8354C25.6052 10.8202 26.2547 12.077 25.5769 12.9296L14.0812 27.3897C13.3242 28.342 11.7518 27.815 11.7211 26.5987L11.5127 18.3612ZM11.5127 18.3612L15.7804 16.2796"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_chat_action">
                <rect width="32" height="31" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </button>
      ) : (
        <button
          onClick={handleClick}
          disabled={disabled}
          className={`
            w-full h-14 rounded-2xl text-white text-base font-semibold bg-[#FC3367]
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {label}
        </button>
      )}
    </>
  );
}
