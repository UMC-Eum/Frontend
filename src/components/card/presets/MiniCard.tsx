import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import LikeAction from "../actions/LikeAction";
import { RoundCardShell } from "../shell/RoundCardShell";

import { useLike } from "../../../hooks/useLike";
import { useNavigate } from "react-router-dom";

type MiniCardProps = {
  targetUserId: number;
  initialIsLiked?: boolean;
  initialHeartId?: number | null;

  profileUrl: string;
  imageUrl: string;
  nickname: string;
  age: number;
  area: string;
  isReceived?: boolean;
};

export default function MiniCard({
  targetUserId,
  initialIsLiked,
  initialHeartId,
  profileUrl,
  imageUrl,
  nickname,
  age,
  area,
  isReceived = false,
}: MiniCardProps) {
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
    <div
      className="flex w-[173px] cursor-pointer"
      onClick={handleBackgroundClick}
    >
      <RoundCardShell imageUrl={imageUrl}>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-[12px] right-[6px] shrink-0 z-20"
        >
          {isReceived ? null : (
            <LikeAction
              isLiked={isLiked}
              onLike={toggleLike}
              size="sm"
              variant="smallIcon"
            />
          )}
        </div>

        <div className="absolute left-4 bottom-2 text-white z-10">
          <CardUserId
            name={nickname}
            age={age}
            isVerified={false}
            textsize="[18px]"
            bold="semi-bold"
          />

          <div className="-mt-3">
            <CardLocation area={area} textsize="text-[14px]" />
          </div>
        </div>
      </RoundCardShell>
    </div>
  );
}
