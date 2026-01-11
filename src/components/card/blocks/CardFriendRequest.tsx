interface CardFriendRequestProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
}

export function CardFriendRequest({
  onClick,
  label = "친구 요청",
  disabled = false,
}: CardFriendRequestProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
      disabled={disabled}
      className={`
        w-full h-14
        rounded-2xl
        text-white text-base font-semibold
        bg-[#1EA7FD]
        transition
        active:scale-[0.98]
        disabled:opacity-50
        disabled:active:scale-100
      `}
    >
      {label}
    </button>
  );
}
