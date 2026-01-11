// card/actions/VoiceAction.tsx
interface VoiceActionProps {
  onToggle?: () => void;
  isPlaying?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap: Record<"sm" | "md" | "lg", string> = {
  sm: "w-10 h-10 text-lg",
  md: "w-12 h-12 text-xl",
  lg: "w-14 h-14 text-2xl",
};

export default function VoiceAction({
  onToggle,
  isPlaying = false,
  size = "md",
}: VoiceActionProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle?.();
      }}
      className={`
        ${sizeMap[size]}
        rounded-full
        bg-black/40 backdrop-blur
        flex items-center justify-center
        text-white
        active:scale-95
        transition
      `}
      aria-label="음성 소개 듣기"
    >
      {isPlaying ? "🔊" : "🔈"}
    </button>
  );
}
