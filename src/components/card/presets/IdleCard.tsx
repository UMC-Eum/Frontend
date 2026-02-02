import { useEffect } from "react";
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import { CardDescription } from "../blocks/CardDescription";
import { CardKeywords } from "../blocks/CardKeywords";
import { CardActions } from "../actions/CardActions";
import { RoundCardShell } from "../shell/RoundCardShell";

import { useMoveToChat } from "../../../hooks/UseMoveToChat";
import { useLike } from "../../../hooks/useLike";
import { useHeartStatus } from "../../../hooks/useHeartStatus"; // 1단계 훅
import { useNavigate } from "react-router-dom";

type IdleCardProps = {
  // 🔥 [변경] 이제 상태 관련 Props는 싹 다 필요 없음. 오직 ID만!
  targetUserId: number; 

  // UI 관련 Props는 유지
  profileUrl: string;
  imageUrl: string;
  nickname: string;
  age: number;
  distance: string;
  area: string;
  description: string;
  keywords: string[];
};

export default function IdleCard({
  targetUserId,
  profileUrl,
  imageUrl,
  nickname,
  age,
  distance,
  area,
  description,
  keywords,
}: IdleCardProps) {

  // 1️⃣ API 조회 (서버에 물어봄: "얘 좋아요 눌렀냐?")
  const { isLiked: apiIsLiked, heartId: apiHeartId, isLoading } = useHeartStatus(targetUserId);

  // 2️⃣ 좋아요 기능 (일단 기본값 false로 초기화해두고 대기)
  const { isLiked, toggleLike, setIsLiked, setHeartId } = useLike({
    targetUserId,
    initialIsLiked: false, // 일단 false로 시작
    initialHeartId: null,
  });

  // 3️⃣ [동기화] API 응답이 오면 useLike 상태를 업데이트 (덮어쓰기)
  useEffect(() => {
    // 로딩 끝났고, 데이터가 유효하면 상태 갱신
    if (!isLoading && apiIsLiked !== undefined) {
      setIsLiked(apiIsLiked);
      if (apiHeartId !== null) setHeartId(apiHeartId);
    }
  }, [isLoading, apiIsLiked, apiHeartId, setIsLiked, setHeartId]);


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
        <CardLocation distance={distance} area={area} />
        <CardDescription>{description}</CardDescription>
        <div className="pb-1">
          <CardKeywords keywords={keywords} />
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          {/* 로딩 중일 때 버튼 비활성화나 스켈레톤 처리가 필요하면 여기서 isLoading 사용 */}
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