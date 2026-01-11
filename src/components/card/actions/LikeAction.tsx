// card/blocks/actions/LikeAction.tsx
interface LikeActionProps {
  onLike: () => void;
  size?: "sm" | "md" | "lg";
  variant?: "text" | "icon";
}

const sizeMap: Record<"sm" | "md" | "lg", string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-12 px-4 text-sm",
  lg: "h-14 px-6 text-base",
};

export function LikeAction({
  onLike,
  size = "md",
  variant = "text",
}: LikeActionProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onLike();
      }}
      className={[
        sizeMap[size],
        "bg-white text-black rounded-xl",
        "active:bg-[#fc3367]",
        "flex items-center justify-center",
      ].join(" ")}
    >
      {variant === "icon" ? "❤️" : "마음에 들어요"}
    </button>
  );
}

// ✅ 안정성용 default export (선택이지만 추천)
export default LikeAction;

