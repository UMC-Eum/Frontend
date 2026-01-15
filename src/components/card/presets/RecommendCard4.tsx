// card/presets/RecommendCard3.tsx
import { CardShell } from "../shell/CardShell";
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import { CardDescription } from "../blocks/CardDescription";
import { CardKeywords } from "../blocks/CardKeywords";
import { LikeAction } from "../actions/LikeAction";
import CloseAction from "../actions/CloseAction";
import { ChatAction } from "../actions/ChatAction";

export default function RecommendCard4() {
  return (
      <CardShell 
      imageUrl="https://picsum.photos/400/600"
      maxwidth="full"
      >
        
        {/* 🔹 배경 그라데이션 (높이 조절) */}
        <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-10" />

        {/* 🔹 [핵심] 하단 통합 컨테이너 */}
        {/* absolute를 각각 주지 않고, 가장 큰 껍데기 하나만 바닥에 붙입니다. */}
        {/* flex-col을 써서 내부 요소들이 세로로 차곡차곡 쌓이게 합니다. */}
        <div className="absolute inset-x-0 bottom-0 p-4 z-20 flex flex-col gap-5">
          
          {/* 1. 텍스트 정보 영역 */}
          <div className="flex flex-col gap-1">
            <CardUserId name="테스트유저" age={27} isVerified />
            
            <div className="">
              <CardLocation distance="2km" area="광주 인근" showIcon={true} />
            </div>

            <div className="">
              <CardDescription>
                이 카드는 테스트용 IdleCard입니다.
              </CardDescription>
            </div>

            <div className="">
              <CardKeywords
                keywords={[
                  { id: 1, label: "차분함", category: "character" },
                  { id: 2, label: "규칙적", category: "lifestyle" },
                  { id: 3, label: "집돌이", category: "lifestyle" },
                  { id: 4, label: "조용함", category: "character" },
                ]}
                mode="transparent"
              />
            </div>
          </div>

          {/* 2. 프로필 보러가기 버튼 (중간에 끼워넣기) */}
          {/* Flex 흐름 안에 있으므로 위 텍스트와 아래 버튼 사이를 자동으로 밀어냅니다. */}

          {/* 3. 하단 액션 버튼들 (맨 아래) */}
          <div className=" -mt-5 flex justify-start gap-13 pb-2">
            {/* gap-13은 Tailwind 기본값이 아닙니다. gap-6(24px) ~ gap-10(40px) 추천 */}
            
            {/* ❌ X 버튼 */}
            <CloseAction size="sm" onClose={() => console.log("닫기 클릭")} />


            {/* ❤️ 좋아요 */}
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