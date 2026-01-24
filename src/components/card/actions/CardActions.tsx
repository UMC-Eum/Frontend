interface Props {
  isLiked?: boolean; // ✅ 상태를 받아야 색을 유지할 수 있음
  onLike?: () => void;
  onChat?: () => void;
}

export function CardActions({ isLiked = false, onLike, onChat }: Props) {
  return (
    <div className="flex gap-3 w-full">
      {/* 좋아요 버튼 */}
      {onLike && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          className={`
            flex-1 h-12 rounded-xl font-semibold text-base transition-colors duration-200
            ${isLiked 
              ? "bg-[#fc3367] text-white shadow-md" // ❤️ 좋아요 ON: 핑크색 + 흰글씨
              : "bg-white text-black hover:bg-gray-50 active:scale-95" // 🤍 좋아요 OFF: 흰색
            }
          `}
        >
          {"마음에 들어요"}
        </button>
      )}

      {/* 채팅 버튼 */}
      {onChat && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChat();
          }}
          className="
            flex-1 h-12 bg-white text-black rounded-xl font-semibold text-base
            hover:bg-gray-50 active:scale-95 transition-transform
          "
        >
          바로 대화해보기
        </button>
      )}
    </div>
  );
}