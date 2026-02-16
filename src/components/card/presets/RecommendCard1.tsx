import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import { CardDescription } from "../blocks/CardDescription";
import { CardKeywords } from "../blocks/CardKeywords";
import { CardRecommend } from "../blocks/CardRecommend";
import { RoundCardShell } from "../shell/RoundCardShell";

type RecommendCardProps = {
  targetUserId: number;
  profileUrl: string;
  imageUrl: string;
  nickname: string;
  age: number;
  area: string;
  description: string;
  keywords: string[];
  onGoProfile: () => void;
  className?: string; // [추가] 외부에서 스타일을 받을 수 있게 추가
};

export default function RecommendCard({
  targetUserId,
  imageUrl,
  nickname,
  age,
  area,
  description,
  keywords,
  onGoProfile,
  className, // [추가] 구조 분해 할당
}: RecommendCardProps) {
  const handleBackgroundClick = () => {
    onGoProfile();
  };
  const handleProfileClick = () => {
    onGoProfile();
    console.log(
      `[Navigation] 유저 ID ${targetUserId}번 상세 페이지로 이동합니다.`,
    );
  };

  return (
    <RoundCardShell
      imageUrl={imageUrl}
      onClick={handleBackgroundClick}
      // [수정] 기존 스타일과 외부에서 들어온 className을 합쳐줍니다.
      // 튜토리얼에서는 pointer-events-none이 들어오므로 cursor-pointer가 무시되어도 괜찮습니다.
      className={`cursor-pointer ${className || ""}`}
    >
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 pointer-events-none" />

      <div className="absolute left-0 right-0 bottom-0 p-4 z-20 flex flex-col gap-5">
        <div className="flex flex-col gap-1 text-white">
          <CardUserId name={nickname} age={age} isVerified />

          <div className="-mt-2">
            <CardLocation area={area} showIcon={true} />
          </div>

          <div className="-mb-1">
            <CardDescription>{description}</CardDescription>
          </div>

          <div className="">
            <CardKeywords keywords={keywords} mode="transparent" />
          </div>
        </div>

        <div onClick={(e) => e.stopPropagation()} className="-mt-1 mb-2">
          <CardRecommend onClick={handleProfileClick} />
        </div>
      </div>
    </RoundCardShell>
  );
}
