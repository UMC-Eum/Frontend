// card/blocks/actions/ChatAction.tsx
interface ChatActionProps {
  onChat: () => void;
  size?: "sm" | "md" | "lg";
}

export function ChatAction({
  onChat,
  size = "md",
}: ChatActionProps) {
  const sizeMap = {
    sm: "h-8 px-3 text-xs",
    md: "h-12 px-4 text-sm",
    lg: "h-14 px-6 text-base",
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChat();
      }}
      className={`
        ${sizeMap[size]}
        bg-white text-black rounded-xl
        active:bg-[#fc3367]
      `}
    >
      바로 대화해보기
    </button>
  );
}
