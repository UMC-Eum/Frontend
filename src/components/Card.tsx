import cerficationmark from "../assets/card_cerfication.svg";
import locationmark from "../assets/card_location.svg";
import { Keyword } from "./keyword/keyword.model";
import KeywordLabel from "./keyword/KeywordLabel";

interface CardProps {
  imageUrl: string;
  name: string;
  age: number;
  distance: string;
  description: string;
  keywords: Keyword[];
  isVerified?: boolean;
  onLike?: () => void;
  onChat?: () => void;
  onDetailClick?: () => void;
}

export default function Card({
  imageUrl,
  name,
  age,
  distance,
  description,
  keywords,
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
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-2xl font-bold">
            {name} {age}
          </h2>
          {isVerified && <img src={cerficationmark} alt="인증마크" />}
        </div>
        <p className="flex text-sm opacity-90 mb-2">
          <img className="h-4 w-4" src={locationmark} alt="지역마크" />{" "}
          {distance}
        </p>

        {/* 디스크립션 (클릭 시 이벤트만 전달) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onDetailClick?.();
          }}
          className="
          text-sm mb-3 truncate cursor-pointer
          transition active:scale-[0.97] active:bg-gray-500
          "
        >
          {description}
        </div>

        {/* 키워드 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {keywords.map((keyword, index) =>
            index < 2 ? (
              <KeywordLabel keyword={keyword} isActive={true} />
            ) : (
              <KeywordLabel keyword={keyword} isTransparent={true} />
            )
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike?.();
            }}
            className="
              flex-1 h-12 bg-white text-black rounded-xl
              transition active:scale-[0.97] active:bg-[#fc3367]
            "
          >
            마음에 들어요
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onChat?.();
            }}
            className="
              flex-1 h-12 bg-white/90 text-black rounded-xl
              transition active:scale-[0.97] active:bg-[#fc3367]
            "
          >
            바로 대화해보기
          </button>
        </div>
      </div>
    </div>
  );
}
