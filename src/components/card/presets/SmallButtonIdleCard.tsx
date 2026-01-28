import { CardShell } from "../shell/CardShell";
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import { CardDescription } from "../blocks/CardDescription";
import { CardKeywords } from "../blocks/CardKeywords";
import { ChatAction } from "../actions/ChatAction";
import LikeAction from "../actions/LikeAction"; 
import CloseAction from "../actions/CloseAction";

// ✅ 훅 불러오기 (경로가 맞는지 확인해주세요)
import { useMoveToChat } from "../../../hooks/UseMoveToChat"; // 파일명 대소문자 주의
import { useLike } from "../../../hooks/useLike";
import { useNavigate } from "react-router-dom";

type SmallButtonIdleCardProps = {
  profileUrl: string;
  targetUserId: number; 
  imageUrl: string;
  name: string;
  age: number;
  distance: string;
  area: string;
  keywords: string[];
  description: string;
  initialHeartId?: number; // ✅ 좋아요 취소용 ID
  initialIsLiked?: boolean; // ✅ 초기 좋아요 상태
}

export default function SmallButtonIdleCard({ 
  profileUrl,
  targetUserId, 
  imageUrl, 
  name, 
  age, 
  distance, 
  area, 
  keywords, 
  description,
  initialHeartId, // ✅ 여기랑
  initialIsLiked  // ✅ 여기에 추가해서 받아와야 함
}: SmallButtonIdleCardProps) {
  
  // ✅ 1. 채팅 이동 훅
  const { startChat } = useMoveToChat();

  // ✅ 2. 좋아요 훅 (반드시 컴포넌트 내부에서 호출!)
  const { isLiked, toggleLike } = useLike({
    targetUserId,
    initialIsLiked,
    initialHeartId
  });

  // 배경이미지클릭시 프로필 화면으로 이동
  const navigate = useNavigate();

  const handleBackgroundClick = () => {
    navigate(profileUrl);
  };

  return (
    <CardShell imageUrl={imageUrl} onClick={handleBackgroundClick} className="cursor-pointer">
      {/* 하단 그라데이션 */}
      <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

      {/* 텍스트 정보 영역 */}
      <div className="absolute left-4 right-4 bottom-28 text-white z-10">
        <CardUserId name={name} age={age} isVerified />

        <div className="mt-1">
          <CardLocation distance={distance} area={area} />
        </div>

        <div className="mt-2">
          <CardDescription>
            {description}
          </CardDescription>
        </div>

        <div className="mt-3">
          <CardKeywords
            keywords={keywords}
            mode="transparent"
          />
        </div>
      </div>

      {/* 하단 액션 버튼 */}
      <div onClick={(e) => e.stopPropagation()} className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-13 z-20">
        {/* X 버튼 */}
        <CloseAction size="md" onClose={() => console.log("닫기 클릭")} />

        {/* ✅ 채팅 버튼 */}
        <ChatAction
          onChat={() => startChat(targetUserId)} 
          size="lg"
        />

        {/* ✅ 좋아요 버튼 (이제 정상 작동함) */}
        <LikeAction
          isLiked={isLiked}    // 훅 상태 연결
          onLike={toggleLike}  // 훅 함수 연결
          size="md"
          variant="bigIcon"
        /> 
      </div>
    </CardShell>
  );
}