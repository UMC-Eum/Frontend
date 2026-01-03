interface CardProps {
  imageUrl: string
  name: string
  age: number
  distance: string
  description: string
  tags: string[]
  isVerified?: boolean
  onLike?: () => void
  onChat?: () => void
  onDetailClick?: () => void
}

export default function Card({
  imageUrl,
  name,
  age,
  distance,
  description,
  tags,
  isVerified = true,
  onLike,
  onChat,
  onDetailClick,
}: CardProps) {
  return (
    <div
      className="
        relative w-full max-w-sm aspect-[3/4]
        rounded-2xl overflow-hidden shadow-lg
        transition-transform duration-300 active:scale-[0.98]
      "
    >
      {/* 배경 이미지 */}
      <img
        src={imageUrl}
        alt={`${name} 프로필`}
        className="w-full h-full object-cover"
      />

      {/* 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* 정보 영역 */}
      <div className="absolute bottom-0 w-full px-[5%] pb-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-2xl font-bold">
            {name} {age}
          </h2>
          {isVerified && <span className="text-sm">✔</span>}
        </div>

        <p className="text-sm opacity-90 mb-2">📍 {distance}</p>

        {/* 디스크립션 (클릭 시 이벤트만 전달) */}
        <div
          onClick={(e) => {
            e.stopPropagation()
            onDetailClick?.()
          }}
          className="
          text-sm mb-3 truncate cursor-pointer
          transition active:scale-[0.97] active:bg-gray-500
          "
        >
          {description}
        </div>

        {/* 태그 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span
              key={tag}
              className={`px-2 py-1 text-xs rounded-md
                ${
                  index < 2
                    ? "bg-[#FF88A6] text-white"
                    : "bg-white/20 text-white"
                }
              `}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onLike?.()
            }}
            className="
              flex-1 h-12 bg-white text-black rounded-xl
              transition active:scale-[0.97] active:bg-gray-200
            "
          >
            마음에 들어요
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onChat?.()
            }}
            className="
              flex-1 h-12 bg-white/90 text-black rounded-xl
              transition active:scale-[0.97] active:bg-gray-200
            "
          >
            바로 대화해보기
          </button>
        </div>
      </div>
    </div>
  )
}