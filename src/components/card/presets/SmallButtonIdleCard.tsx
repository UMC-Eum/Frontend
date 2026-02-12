import { CardShell } from "../shell/CardShell";
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import { CardDescription } from "../blocks/CardDescription";
import { CardKeywords } from "../blocks/CardKeywords";
import { ChatAction } from "../actions/ChatAction";
import LikeAction from "../actions/LikeAction";
import CloseAction from "../actions/CloseAction";

import { useMoveToChat } from "../../../hooks/UseMoveToChat";
import { useLike } from "../../../hooks/useLike";
import { useNavigate } from "react-router-dom";

type SmallButtonIdleCardProps = {
  profileUrl: string;
  targetUserId: number;
  imageUrl: string;
  nickname: string;
  age: number;
  area: string;
  keywords: string[];
  description: string;
  initialHeartId?: number | null;
  initialIsLiked?: boolean;
};

export default function SmallButtonIdleCard({
  targetUserId,
  imageUrl,
  nickname,
  age,
  area,
  keywords,
  description,
  initialHeartId,
  initialIsLiked,
  profileUrl,
}: SmallButtonIdleCardProps) {
  const { startChat } = useMoveToChat();

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
      <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
      <div className="absolute left-4 right-4 bottom-28 text-white z-10">
        <CardUserId name={nickname} age={age} isVerified />

        <div className="mt-1">
          <CardLocation area={area} />
        </div>

        <div className="mt-2">
          <CardDescription>{description}</CardDescription>
        </div>

        <div className="mt-3">
          <CardKeywords keywords={keywords} mode="transparent" />
        </div>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-13 z-20"
      >
        <CloseAction size="md" onClose={() => console.log("닫기 클릭")} />

        <ChatAction onChat={() => startChat(targetUserId)} size="lg" />

        <LikeAction
          isLiked={isLiked}
          onLike={toggleLike}
          size="md"
          variant="bigIcon"
        />
      </div>
    </CardShell>
  );
}
