// card/presets/ProfileCard.tsx
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import { CardDescription } from "../blocks/CardDescription";
import { CardKeywords } from "../blocks/CardKeywords";
import { CardRecommend } from "../blocks/CardRecommend";
import { RoundCardShell } from "../shell/RoundCardShell";

export default function RecommendCard() {
  return (
    <RoundCardShell imageUrl="https://picsum.photos/400/600">
      
      {/* 🔹 1. 배경 그라데이션 */}
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 pointer-events-none" />
      
      {/* 🔹 2. 통합 컨테이너 (핵심 수정) */}
      <div className="absolute left-0 right-0 bottom-0 p-4 z-20 flex flex-col gap-5">

        {/* 텍스트 정보 그룹 */}
        <div className="flex flex-col gap-1">
         
          {/* 이름 & 나이 */}
          <CardUserId name="김철수" age={67} isVerified />

          {/* 위치 (이름 바로 아래 붙음) */}
          <div className="-mt-2">
            <CardLocation distance="14km" area="서울 인근" showIcon={true} />
          </div>

          {/* 한줄 소개 (간격 확보) */}
          <div className="-mb-1">
            <CardDescription>
              어쩌구 저쩌구 한줄소개.
            </CardDescription>
          </div>

          {/* 키워드 영역 */}
          <div className="">
            <CardKeywords
              keywords={[
                { id: 1, label: "영화보기", category: "hobby" },
                { id: 2, label: "등산", category: "hobby" },
                { id: 3, label: "게임하기", category: "hobby" },
                { id: 4, label: "조용한 성격", category: "character" },
              ]}
              mode="transparent"
            />
          </div>
        </div>

        {/* 🔹 CTA 버튼 */}
        {/* flex 컨테이너 안에 있으므로, 위 텍스트가 길어지면 버튼은 바닥에 유지되면서 텍스트를 위로 밀어냅니다 */}
        <div className="-mt-1 mb-2">
          <CardRecommend
            onClick={() => console.log("프로필 보러가기 클릭")}
          />
        </div>
      </div>
    </RoundCardShell>
  );
}