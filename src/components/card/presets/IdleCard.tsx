import { useMemo } from "react";
import { useUserStore } from "../../../stores/useUserStore";
import { getSortedKeywords } from "../../../utils/userUtils";
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import { CardDescription } from "../blocks/CardDescription";
import { CardKeywords } from "../blocks/CardKeywords";
import { CardActions } from "../actions/CardActions";
import { RoundCardShell } from "../shell/RoundCardShell";
import { useMoveToChat } from "../../../hooks/UseMoveToChat";
import { useLike } from "../../../hooks/useLike";
import { useNavigate } from "react-router-dom";

type IdleCardProps = {
  targetUserId: number;
  initialIsLiked?: boolean;
  initialHeartId?: number | null;
  profileUrl: string;
  imageUrl: string;
  nickname: string;
  age: number;
  area: string;
  description: string;
  keywords: string[];
};

export default function IdleCard({
  targetUserId,
  initialIsLiked,
  initialHeartId,
  profileUrl,
  imageUrl,
  nickname,
  age,
  area,
  description,
  keywords,
}: IdleCardProps) {
  const myKeywords = useUserStore((state) => state.user?.keywords || []);
  const { sorted, common } = useMemo(
    () => getSortedKeywords(myKeywords, keywords),
    [myKeywords, keywords],
  );

  const { isLiked, toggleLike } = useLike({
    targetUserId,
    initialIsLiked,
    initialHeartId,
  });

  const { startChat } = useMoveToChat();
  const navigate = useNavigate();

  const handleBackgroundClick = () => {
    navigate(profileUrl);
  };

  return (
    <RoundCardShell
      imageUrl={imageUrl}
      onClick={handleBackgroundClick}
      className="cursor-pointer"
    >
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-t from-black/90 via-black/50 to-transparent pointer-events-none" />

      <div className="absolute inset-x-4 bottom-4 text-white z-10 space-y-3">
        <CardUserId name={nickname} age={age} isVerified />
        <CardLocation area={area} />
        <CardDescription>{description}</CardDescription>

        <div className="pb-1">
          <CardKeywords keywords={sorted} commonKeywords={common} />
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <CardActions
            isLiked={isLiked}
            onLike={toggleLike}
            onChat={() => startChat(targetUserId)}
          />
        </div>
      </div>
    </RoundCardShell>
  );
}
