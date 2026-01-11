// card/actions/CloseAction.tsx
interface CloseActionProps {
  onClose?: () => void;
  size?: "sm" | "md" | "lg";
}

const sizeMap: Record<"sm" | "md" | "lg", string> = {
  sm: "w-10 h-10 text-lg",
  md: "w-12 h-12 text-xl",
  lg: "w-14 h-14 text-2xl",
};

export default function CloseAction({
  onClose,
  size = "md",
}: CloseActionProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClose?.();
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
      aria-label="닫기"
    >
      ×
    </button>
  );
}
