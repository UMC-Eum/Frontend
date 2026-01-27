// card/presets/ProfileCard.tsx
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import { CardDescription } from "../blocks/CardDescription";
import { CardKeywords } from "../blocks/CardKeywords";
import { CardRecommend } from "../blocks/CardRecommend";
import { RoundCardShell } from "../shell/RoundCardShell";

type RecommendCardProps = {
  imageUrl: string;
  name: string;
  age: number;
  distance: string;
  area: string;
  description: string;
  keywords: string[];
}
export default function RecommendCard({ imageUrl, name, age, distance, area, description, keywords }: RecommendCardProps) {
  return (
    <RoundCardShell imageUrl={imageUrl}>
      
      {/* 배경 그라데이션 */}
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 pointer-events-none" />
      
      {/* 통합 컨테이너 */}
      <div className="absolute left-0 right-0 bottom-0 p-4 z-20 flex flex-col gap-5">

        {/* 텍스트 정보 그룹 */}
        <div className="flex flex-col gap-1">
         
          {/* 이름 & 나이 */}
          <CardUserId name={name} age={age} isVerified />

          {/* 위치 (이름 바로 아래 붙음) */}
          <div className="-mt-2">
            <CardLocation distance={distance} area={area} showIcon={true} />
          </div>

          {/* 한줄 소개 (간격 확보) */}
          <div className="-mb-1">
            <CardDescription>
              {description}
            </CardDescription>
          </div>

          {/* 키워드 영역 */}
          <div className="">
            <CardKeywords
              keywords={keywords}
              mode="transparent"
            />
          </div>
        </div>

        {/* CTA 버튼 */}
        <div className="-mt-1 mb-2">
          <CardRecommend
            onClick={() => console.log("프로필 보러가기 클릭")}
          />
        </div>
      </div>
    </RoundCardShell>
  );
}