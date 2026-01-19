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
        w-full h-10
        rounded-lg
        text-white text-base
        bg-[#1EA7FD]
        transition
        disabled:opacity-50
      `}
    >
      {label}
    </button>
  );
}
