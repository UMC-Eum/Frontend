// card/presets/RecommendCard3.tsx
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import { CardDescription } from "../blocks/CardDescription";
import { CardKeywords } from "../blocks/CardKeywords";
import { LikeAction } from "../actions/LikeAction";
import CloseAction from "../actions/CloseAction";
import { CardRecommend } from "../blocks/CardRecommend";
import VoiceAction from "../actions/VoiceActions";
import { RoundCardShell } from "../shell/RoundCardShell";
import { Keyword } from "../../keyword/keyword.model";

type RecommendCard3Props = {
  imageUrl: string;
  name: string;
  age: number;
  distance: string;
  area: string;
  keywords: Keyword[];
  description: string;
}
export default function RecommendCard3({ imageUrl, name, age, distance, area, keywords, description }: RecommendCard3Props) {
  return (  
    <RoundCardShell imageUrl={imageUrl}>
      
      {/* 배경 그라데이션 (높이 조절) */}
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-10" />

      {/* 하단 통합 컨테이너 */}
      <div className="absolute inset-x-0 bottom-0 p-4 z-20 flex flex-col gap-5">
        
        {/* 텍스트 정보 영역 */}
        <div className="flex flex-col gap-1">
          <CardUserId name={name} age={age} isVerified />
          
          <div className="">
            <CardLocation distance={distance} area={area} showIcon={true} />
          </div>

          <div className="">
            <CardDescription>
              {description}
            </CardDescription>
          </div>

          <div className="">
            <CardKeywords
              keywords={keywords}
              mode="transparent"
            />
          </div>
        </div>

        {/* 2. 프로필 보러가기 버튼 (중간에 끼워넣기) */}
        {/* Flex 흐름 안에 있으므로 위 텍스트와 아래 버튼 사이를 자동으로 밀어냅니다. */}

        {/* 하단 액션 버튼들 */}
        <div className=" -mt-5 flex items-center justify-center gap-13 pb-2">
          {/* gap-13은 Tailwind 기본값이 아닙니다. gap-6(24px) ~ gap-10(40px) 추천 */}
          
          {/* X 버튼 */}
          <CloseAction size="sm" onClose={() => console.log("닫기 클릭")} />

          {/* 채팅 */}
          <VoiceAction 
            onVoice={() => console.log("음성 클릭!")}
            size="lg"
          />

          {/* 좋아요 */}
          <LikeAction
            onLike={() => console.log("좋아요 클릭!")}
            size="base"
            variant="bigIcon"
          />
        </div>
        <div className="-mt-2">
           <CardRecommend
             label="추천 프로필 더 보러가기"
             onClick={() => console.log("프로필 보러가기 클릭")}
           />
        </div>

      </div>
    </RoundCardShell>
  );
}