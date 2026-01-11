// card/blocks/CardActions.tsx
interface Props {
  onLike?: () => void;
  onChat?: () => void;
}

export function CardActions({ onLike, onChat }: Props) {
  return (
    <div className="flex gap-3">
      {onLike && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          className="
              flex-1 h-12 bg-white text-black rounded-xl
              active:bg-[#fc3367]
            "
        >
          마음에 들어요
        </button>
      )}

      {onChat && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChat();
          }}
          className="
              flex-1 h-12 bg-white text-black rounded-xl
              active:bg-[#fc3367]
            "
        >
          바로 대화해보기
        </button>
      )}
    </div>
  );
}
