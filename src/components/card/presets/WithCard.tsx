import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import { CardDescription } from "../blocks/CardDescription";
import { CardWithButton } from "../actions/CardWithButton";
import { CardHighlightMessage } from "../blocks/CardHighlightMessage";
import { CardMoreButton } from "../blocks/CardMoreButton";
import { RoundCardShell } from "../shell/RoundCardShell";

type WithCardProps = {
  imageUrl: string;
  name: string;
  age: number;
  distance: string;
  area: string;
  description: string;
}
export default function WithCard({ imageUrl, name, age, distance, area, description }: WithCardProps) {
  return (
    <RoundCardShell 
      imageUrl={imageUrl}
      size="1/1"
      maxwidth="sm"
    >
      {/* 상단 레이아웃 */}
      <div className="absolute top-5 left-4 right-4 flex justify-between items-start z-20">
        <div className="flex items-center gap-3">
          {/* 프로필 이미지 */}
          <div className="w-[40px] h-[40px] rounded-full overflow-hidden">
             <img src={imageUrl} className="w-full h-full object-cover" />
          </div>

          <div className="flex flex-col justify-center">
            {/* 재사용 가능한 블록 배치 */}
            <CardUserId
              name={name}
              age={age}
              textsize="text-[16px]"
            />
            
            {/* 위치 블록 배치 */}
            <div className="mt-[-14px] opacity-90 scale-95 origin-left">
               <CardLocation area={area} distance={distance} />
            </div>
          </div>
        </div>

        {/* 메뉴 아이콘 */}
        <CardMoreButton onClick={() => console.log("더보기 클릭")} />
      </div>

      {/* 설명 영역 */}
      <div className="absolute left-4 right-4 bottom-24 z-20">
        <div className="text-white">
          <CardDescription>
            {description}
          </CardDescription>
        </div>

        <div className="mt-3 -mb-3 flex items-center gap-2">
          <CardHighlightMessage text="같이 진지하게 만날래?" time="2분 전"/>
        </div>
      </div>

      {/* 하단 CTA 버튼 */}
      <div className="absolute left-4 right-4 bottom-5 z-20">
        <CardWithButton
          label="👋 같이 할래요"
          onClick={() => console.log("같이 하기 클릭!")}
        />
      </div>
    </RoundCardShell>
  );
}
