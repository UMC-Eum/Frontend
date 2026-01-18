// card/presets/ProfileCard.tsx
import { CardShell } from "../shell/CardShell";
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import { CardDescription } from "../blocks/CardDescription";
import { CardKeywords } from "../blocks/CardKeywords";
import { ChatAction } from "../actions/ChatAction";
import { LikeAction } from "../actions/LikeAction";
import CloseAction from "../actions/CloseAction";
import { Keyword } from "../../keyword/keyword.model";

type SmallButtonIdleCardProps = {
  imageUrl: string;
  name: string;
  age: number;
  distance: string;
  area: string;
  keywords: Keyword[];
  description: string;
}
export default function SmallButtonIdleCard({ imageUrl, name, age, distance, area, keywords, description }: SmallButtonIdleCardProps) {
  return (
    <CardShell imageUrl={imageUrl} >
      {/* 하단 그라데이션 */}
      <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* 텍스트 정보 영역 */}
      <div className="absolute left-4 right-4 bottom-28 text-white">
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
      <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-13">
        {/* X 버튼 */}
        <CloseAction size="md" onClose={() => console.log("닫기 클릭")} />

        {/* 채팅 */}
        <ChatAction
          onChat={() => console.log("채팅 보내기 클릭!")}
          size="lg"
        />

        {/* 좋아요 */}
        <LikeAction
          onLike={() => console.log("좋아요 클릭!")}
          size="md"
          variant="bigIcon"
        />
      </div>
    </CardShell>
  );
}
