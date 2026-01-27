// card/presets/RecommendCard3.tsx
import { CardShell } from "../shell/CardShell";
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import { CardDescription } from "../blocks/CardDescription";
import { CardKeywords } from "../blocks/CardKeywords";
import { LikeAction } from "../actions/LikeAction";
import CloseAction from "../actions/CloseAction";
import { ChatAction } from "../actions/ChatAction";
import { Keyword } from "../../keyword/keyword.model";


type RecommendCard4Props = {
  imageUrl: string;
  name: string;
  age: number;
  distance: string;
  area: string;
  keywords: Keyword[];
  description: string;
}
export default function RecommendCard4({ imageUrl, name, age, distance, area, keywords, description }: RecommendCard4Props) {
  return (  
      <CardShell 
      imageUrl={imageUrl}
      maxwidth="full"
      >
        
        {/* 배경 그라데이션 */}
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

          {/* 프로필 보러가기 버튼 */}

          {/* 하단 액션 버튼들 */}
          <div className=" -mt-5 flex justify-start gap-13 pb-2">
            {/* gap-13은 Tailwind 기본값이 아닙니다. gap-6(24px) ~ gap-10(40px) 추천 */}
            
            {/* X 버튼 */}
            <CloseAction size="sm" onClose={() => console.log("닫기 클릭")} />


            {/* 좋아요 */}
            <LikeAction
              onLike={() => console.log("좋아요 클릭!")}
              size="base"
              variant="bigIcon"
            />
          </div>
          <div>
            <ChatAction
              mode="box"
              onChat={() => console.log("채팅 클릭!")}
              label="먼저 말 걸어 보기"
            />
          </div>

        </div>
      </CardShell>
  );
}