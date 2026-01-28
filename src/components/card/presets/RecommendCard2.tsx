// card/presets/RecommendCard2.tsx
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import LikeAction from "../actions/LikeAction"; // 위에서 수정한 파일
import { CardShell } from "../shell/CardShell";
import { useLike } from "../../../hooks/useLike"; // 1번에서 만든 훅 경로
import { useNavigate } from "react-router-dom";

// ✅ Props 정의: 데이터가 없을 수도 있으므로 optional (?) 처리
type RecommendCard2Props = {
  profileUrl: string;
  targetUserId: number; // API 호출을 위해 필수 (없으면 좋아요 불가)
  imageUrl?: string;
  name?: string;
  age?: number;
  distance?: string;
  area?: string;
  // 기존에 좋아요를 누른 상태인지, 그 ID는 무엇인지 (피드 API에서 받아와야 함)
  initialIsLiked?: boolean;
  initialHeartId?: number | null;
};

export default function RecommendCard2({
  profileUrl,
  targetUserId,
  imageUrl = "", // 기본값 처리
  name = "알 수 없음",
  age = 0,
  distance = "-",
  area = "위치 미지정",
  initialIsLiked = false,
  initialHeartId = null,
}: RecommendCard2Props) {
  // ✅ 커스텀 훅 사용 (여기서 API 통신과 상태 관리를 다 해줍니다)
  const { isLiked, toggleLike } = useLike({
    targetUserId,
    initialIsLiked,
    initialHeartId,
  });

  // 배경이미지클릭시 프로필 화면으로 이동
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
      {/* 배경 그라데이션 */}
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-10" />

      {/* 하단 통합 컨테이너 */}
      <div className="absolute inset-x-0 bottom-0 p-4 z-20 flex items-end justify-between gap-2">
        {/* 왼쪽: 유저 정보 */}
        <div className="flex flex-col gap-1 min-w-0">
          <CardUserId name={name} age={age} isVerified />

          <div className="text-sm opacity-90">
            {/* 정보가 없어도 깨지지 않게 렌더링 */}
            <CardLocation distance={distance} area={area} showIcon={true} />
          </div>
        </div>

        {/* 오른쪽: 액션 버튼들 */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-3 shrink-0 pb-0.5"
        >
          <LikeAction
            isLiked={isLiked} // 훅에서 관리하는 상태
            onLike={toggleLike} // 훅에서 관리하는 함수
            size="md"
            variant="bigIcon"
          />
        </div>
      </div>
    </CardShell>
  );
}
