import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import LikeAction from "../actions/LikeAction";
import { CardShell } from "../shell/CardShell";
import { useLike } from "../../../hooks/useLike";
import { useNavigate } from "react-router-dom";

type RecommendCard2Props = {
  profileUrl: string;
  targetUserId: number;
  imageUrl?: string;
  nickname?: string;
  age?: number;
  area?: string;
  description?: string;
  keywords?: string[];
  initialIsLiked?: boolean;
  initialHeartId?: number | null;
};

export default function RecommendCard2({
  profileUrl,
  targetUserId,
  imageUrl = "",
  nickname = "알 수 없음",
  age = 0,
  area = "위치 미지정",

  initialIsLiked = false,
  initialHeartId = null,
}: RecommendCard2Props) {
  const { isLiked, toggleLike } = useLike({
    targetUserId,
    initialIsLiked,
    initialHeartId,
  });

  const navigate = useNavigate();

  const handleBackgroundClick = () => {
    navigate(profileUrl);
  };

  return (
    <CardShell
      imageUrl={imageUrl}
      onClick={handleBackgroundClick}
      className="cursor-pointer"
    >
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 p-4 z-20 flex items-end justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <CardUserId name={nickname} age={age} isVerified />
          <div className="text-sm opacity-90">
            <CardLocation area={area} showIcon={true} />
          </div>
        </div>
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-3 shrink-0 pb-0.5"
        >
          <LikeAction
            isLiked={isLiked}
            onLike={toggleLike}
            size="md"
            variant="bigIcon"
          />
        </div>
      </div>
    </CardShell>
  );
}
