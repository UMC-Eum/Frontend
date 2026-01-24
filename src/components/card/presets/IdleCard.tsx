import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import { CardDescription } from "../blocks/CardDescription";
import { CardKeywords } from "../blocks/CardKeywords";
import { CardActions } from "../actions/CardActions"; // 아까 수정한 CardActions 사용
import { RoundCardShell } from "../shell/RoundCardShell";
import { Keyword } from "../../keyword/keyword.model";

// ✅ 1. 훅 불러오기 (경로를 프로젝트 구조에 맞춰주세요)
import { useMoveToChat } from "../../../hooks/UseMoveToChat";
import { useLike } from "../../../hooks/useLike";

type IdleCardProps = {
  // ✅ 2. API 연동을 위한 필수 정보 추가
  targetUserId: number;         // 채팅/좋아요 대상 ID
  initialIsLiked?: boolean;     // 초기 좋아요 상태
  initialHeartId?: number | null; // 좋아요 취소용 ID

  // 기존 UI Props
  imageUrl: string;
  name: string;
  age: number;
  distance: string;
  area: string;
  description: string;
  keywords: Keyword[];
};

export default function IdleCard({
  targetUserId,   // ✅ 추가됨
  initialIsLiked, // ✅ 추가됨
  initialHeartId, // ✅ 추가됨
  imageUrl,
  name,
  age,
  distance,
  area,
  description,
  keywords,
}: IdleCardProps) {

  // ✅ 3. 채팅 이동 훅 연결
  const { startChat } = useMoveToChat();

  // ✅ 4. 좋아요 로직 훅 연결 (낙관적 업데이트 포함)
  const { isLiked, toggleLike } = useLike({
    targetUserId,
    initialIsLiked,
    initialHeartId,
  });

  return (
    <RoundCardShell imageUrl={imageUrl}>
      {/* 하단 가독성용 그라데이션 */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

      {/* 하단 콘텐츠 영역 */}
      <div className="absolute inset-x-4 bottom-4 text-white z-10 space-y-3">
        {/* 유저 이름 */}
        <CardUserId name={name} age={age} isVerified />

        {/* 위치 */}
        <CardLocation distance={distance} area={area} />

        {/* 소개 */}
        <CardDescription>{description}</CardDescription>

        {/* 키워드 */}
        <div className="pb-1">
          <CardKeywords keywords={keywords} />
        </div>

        {/* ✅ 5. 버튼에 기능 및 상태 연결 */}
        <CardActions
          isLiked={isLiked}              // 상태 전달 (색상 변경용)
          onLike={toggleLike}            // 함수 전달 (API 호출용)
          onChat={() => startChat(targetUserId)} // 채팅방 이동 함수
        />
      </div>
    </RoundCardShell>
  );
}