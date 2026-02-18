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
  onClick?: () => void; // 🔥 [추가] 외부에서 클릭 이벤트를 받을 수 있게 추가
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
  onClick, // 🔥 [추가]
}: MiniCardProps) {
  const { isLiked, toggleLike } = useLike({
    targetUserId,
    initialIsLiked,
    initialHeartId,
  });

  const navigate = useNavigate();

  const handleBackgroundClick = () => {
    // 🔥 [수정] 외부에서 onClick(상세 이동 로직)을 줬으면 그걸 실행하고, 없으면 그냥 url 이동
    if (onClick) {
      onClick();
    } else {
      navigate(profileUrl);
    }
  };

  // 하트 버튼 클릭 핸들러 (이벤트 전파 중단 확실하게 처리)
  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 부모(배경) 클릭 이벤트 전파 중단
    e.preventDefault();  // 기본 동작 방지
    // 여기서 토글 실행하지 않음 (LikeAction 내부에서 실행되거나, 여기서 실행하거나 통일 필요)
    // LikeAction 컴포넌트가 자체적으로 onClick을 가지고 있다면 아래 div는 단순히 전파 방지용입니다.
  };

  return (
    <div
      className="flex w-[173px] cursor-pointer relative" // relative 추가 권장
      onClick={handleBackgroundClick}
    >
      <RoundCardShell imageUrl={imageUrl}>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

        {/* 하트 버튼 영역 */}
        <div
          onClick={handleHeartClick} // 🔥 수정된 핸들러 연결
          className="absolute top-[12px] right-[6px] shrink-0 z-20 cursor-pointer"
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

        <div className="absolute left-4 bottom-2 text-white z-10 pointer-events-none">
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