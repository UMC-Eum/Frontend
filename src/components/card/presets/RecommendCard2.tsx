// card/presets/RecommendCardWithVoice.tsx
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import LikeAction from "../actions/LikeAction";
import { CardShell } from "../shell/CardShell";

type RecommendCard2Props = {
  imageUrl: string;
  name: string;
  age: number;
  distance: string;
  area: string;
}
export default function RecommendCard2({ imageUrl, name, age, distance, area }: RecommendCard2Props) {
  return (
    <CardShell imageUrl={imageUrl}>
      
      {/* 배경 그라데이션 */}
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-10" />

      {/* 하단 통합 컨테이너 (Flex 기반) */}
      <div className="absolute inset-x-0 bottom-0 p-4 z-20 flex items-end justify-between gap-2">
        
        {/* 왼쪽: 유저 정보 (텍스트 영역) */}
        <div className="flex flex-col gap-1 min-w-0"> 
          {/* min-w-0: 텍스트가 너무 길면 줄바꿈되게 하기 위한 안전장치 */}
          <CardUserId name={name} age={age} isVerified />
          
          <div className="text-sm opacity-90">
            <CardLocation distance={distance} area={area} showIcon={true} />
          </div>
        </div>

        {/* 오른쪽: 액션 버튼들 */}
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