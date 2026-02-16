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
  initialHeartId?: number;
  initialIsLiked?: boolean;
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
  initialHeartId,
  initialIsLiked,
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
      className="cursor-pointer"
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
