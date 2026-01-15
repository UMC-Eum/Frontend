import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import { CardDescription } from "../blocks/CardDescription";
import { CardWithButton } from "../actions/CardWithButton";
import { CardHighlightMessage } from "../blocks/CardHighlightMessage";
import { CardMoreButton } from "../blocks/CardMoreButton";
import { RoundCardShell } from "../shell/RoundCardShell";

export default function WithCard() {
  return (
    <RoundCardShell 
      imageUrl="https://picsum.photos/400/600"
      size="1/1"
      maxwidth="sm"
    >
      {/* 🔹 상단 레이아웃: 블록 배치 조절 */}
      <div className="absolute top-5 left-4 right-4 flex justify-between items-start z-20">
        <div className="flex items-center gap-3">
          {/* 프로필 이미지 (블록과 분리하여 레이아웃 구성) */}
          <div className="w-[40px] h-[40px] rounded-full overflow-hidden">
             <img src="https://picsum.photos/100" className="w-full h-full object-cover" />
          </div>

          <div className="flex flex-col justify-center">
            {/* 재사용 가능한 블록 배치 */}
            <CardUserId
              name="언젠간 만나게될까?"
              age={31}
              textsize="text-[16px]"
            />
            
            {/* 위치 블록 배치 (간격/투명도 조절) */}
            <div className="mt-[-14px] opacity-90 scale-95 origin-left">
               <CardLocation area="58.7km" distance="" />
            </div>
          </div>
        </div>

        {/* 메뉴 아이콘 */}
        <CardMoreButton onClick={() => console.log("더보기 클릭")} />
      </div>

      {/* 🔹 설명 영역 */}
      <div className="absolute left-4 right-4 bottom-24 z-20">
        <div className="text-white">
          <CardDescription>
            저랑 진지하게 연락하실 한분 찾습니다! 나이, 장거리 상관없구 마음이 중요한게 아닐까요? 대화 걸어주세요 ^^
          </CardDescription>
        </div>

        <div className="mt-3 -mb-3 flex items-center gap-2">
          <CardHighlightMessage text="같이 진지하게 만날래?" time="2분 전"/>
        </div>
      </div>

      {/* 🔹 하단 CTA 버튼 */}
      <div className="absolute left-4 right-4 bottom-5 z-20">
        <CardWithButton
          label="👋 같이 할래요"
          onClick={() => console.log("같이 하기 클릭!")}
        />
      </div>
    </RoundCardShell>
  );
}
