interface Props {
  isLiked?: boolean;
  onLike?: () => void;
  onChat?: () => void;
}

export function CardActions({ isLiked = false, onLike, onChat }: Props) {
  return (
    <div className="flex gap-3 w-full">
      {onLike && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          className={`
            flex-1 h-12 rounded-xl font-semibold text-base transition-colors duration-200
            ${
              isLiked
                ? "bg-[#fc3367] text-white shadow-md"
                : "bg-white text-black "
            }
          `}
        >
          {"마음에 들어요"}
        </button>
      )}

      {onChat && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChat();
          }}
          className="flex-1 h-12 bg-white text-black rounded-xl font-semibold text-base"
        >
          바로 대화해보기
        </button>
      )}
    </div>
  );
}
