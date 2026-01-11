interface CardRecommendProps {
  onClick: () => void;
  label?: string;
}

export function CardRecommend({
  onClick,
  label = "추천 프로필 보러가기",
}: CardRecommendProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="
        w-full h-14
        rounded-2xl
        text-white text-base font-semibold
        bg-gradient-to-r from-[#FF4D6D] to-[#FFB347]
        active:scale-[0.98]
        transition
      "
    >
      {label}
    </button>
  );
}
