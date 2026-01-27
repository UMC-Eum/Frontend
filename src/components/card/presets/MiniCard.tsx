import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import LikeAction from "../actions/LikeAction";
import { RoundCardShell } from "../shell/RoundCardShell";

// ✅ 1. 훅 불러오기
import { useLike } from "../../../hooks/useLike";

type MiniCardProps = {
  // ✅ 2. API 연동을 위한 필수 Props 추가
  targetUserId: number;
  initialIsLiked?: boolean;
  initialHeartId?: number | null;

  imageUrl: string;
  name: string;
  age: number;
  distance: string;
  area: string;
}
  
export default function MiniCard({ 
  targetUserId,
  initialIsLiked,
  initialHeartId,
  imageUrl, 
  name, 
  age, 
  distance, 
  area 
}: MiniCardProps) {

  // ✅ 3. 좋아요 로직 연결
  const { isLiked, toggleLike } = useLike({
    targetUserId,
    initialIsLiked,
    initialHeartId,
  });

  return (
    <div className="flex w-[173px]">
      <RoundCardShell imageUrl={imageUrl}>
        {/* 하단 가독성용 그라데이션 */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

        {/* 좋아요 버튼 (우상단) */}
        <div className="absolute top-3 right-3 shrink-0 z-20">
          <LikeAction
            isLiked={isLiked}   // ✅ 상태 연결
            onLike={toggleLike} // ✅ 함수 연결
            size="sm"
            variant="smallIcon"
          />
        </div>

        {/* 이름 + 위치 (좌하단) */}
        <div className="absolute left-4 bottom-2 text-white z-10">
          <CardUserId name={name} age={age} isVerified={false} textsize="[18px]" bold="semi-bold" />

          <div className="-mt-3">
            <CardLocation distance={distance} area={area} textsize="text-[14px]" />
          </div>
        </div>
      </RoundCardShell>
    </div>
  );
}