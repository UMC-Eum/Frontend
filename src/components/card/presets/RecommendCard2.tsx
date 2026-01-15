// card/presets/RecommendCardWithVoice.tsx
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import LikeAction from "../actions/LikeAction";
import { CardShell } from "../shell/CardShell";

export default function RecommendCard2() {
  return (
    <CardShell imageUrl="https://picsum.photos/400/600">
      
      {/* 🔹 배경 그라데이션 */}
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-10" />

      {/* 🔹 [핵심] 하단 통합 컨테이너 (Flex 기반) */}
      {/* bottom-0에 붙이고, 내부 아이템을 양옆으로 밀어냄(justify-between) */}
      <div className="absolute inset-x-0 bottom-0 p-4 z-20 flex items-end justify-between gap-2">
        
        {/* 👈 왼쪽: 유저 정보 (텍스트 영역) */}
        <div className="flex flex-col gap-1 min-w-0"> 
          {/* min-w-0: 텍스트가 너무 길면 줄바꿈되게 하기 위한 안전장치 */}
          <CardUserId name="parkjun" age={55} isVerified />
          
          <div className="text-sm opacity-90">
            <CardLocation distance="2km" area="광주 인근" showIcon={true} />
          </div>
        </div>

        {/* 👉 오른쪽: 액션 버튼들 */}
        {/* shrink-0: 공간이 좁아져도 버튼은 절대 찌그러지지 마라 */}
        <div className="flex items-center gap-3 shrink-0 pb-0.5">

          <LikeAction
            onLike={() => console.log("좋아요 클릭")}
            size="md"
            variant="bigIcon"
          />
        </div>

      </div>
    </CardShell>
  );
}