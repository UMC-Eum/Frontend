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
  // ✅ 1. 부모(리스트)에서 받아올 데이터 추가
  targetUserId: number; 
  initialIsLiked?: boolean;     // 추가: 이미 좋아요 눌렀는지?
  initialHeartId?: number | null; // 추가: 좋아요 취소할 때 쓸 ID

  // UI 관련 Props
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
  initialIsLiked, // ✅ Props로 받음
  initialHeartId, // ✅ Props로 받음
  profileUrl,
  imageUrl,
  nickname,
  age,
  area,
  description,
  keywords,
}: IdleCardProps) {

  // ✅ 2. useLike 훅에 바로 꽂아넣기
  // useEffect로 기다릴 필요 없이, 처음부터 완성된 상태로 시작합니다.
  const { isLiked, toggleLike } = useLike({
    targetUserId,
    initialIsLiked, 
    initialHeartId,
  });

  // --- 이하 UI 로직 동일 ---
  const { startChat } = useMoveToChat();
  const navigate = useNavigate();

  const handleBackgroundClick = () => {
    navigate(profileUrl);
  };

  return (
    <RoundCardShell imageUrl={imageUrl} onClick={handleBackgroundClick} className="cursor-pointer">
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

      <div className="absolute inset-x-4 bottom-4 text-white z-10 space-y-3">
        <CardUserId name={nickname} age={age} isVerified />
        <CardLocation area={area} />
        <CardDescription>{description}</CardDescription>
        <div className="pb-1">
          <CardKeywords keywords={keywords} />
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