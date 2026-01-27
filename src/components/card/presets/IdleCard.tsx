// card/presets/ProfileCard.tsx
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import { CardDescription } from "../blocks/CardDescription";
import { CardKeywords } from "../blocks/CardKeywords";
import { CardActions } from "../actions/CardActions";
import { RoundCardShell } from "../shell/RoundCardShell";
import { Keyword } from "../../keyword/keyword.model";

type IdleCardProps = {
  imageUrl: string;
  name: string;
  age: number;
  distance: string;
  area: string
  description: string;
  keywords : Keyword[];
};

export default function IdleCard({
  imageUrl,
  name,
  age,
  distance,
  area,
  description,
  keywords,
}: IdleCardProps) {
  return (
    <RoundCardShell imageUrl={imageUrl}>
      {/* 하단 가독성용 그라데이션 */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/80 to-transparent" />

      {/* 하단 콘텐츠 영역 */}
      <div className="absolute inset-x-4 bottom-4 text-white z-10 space-y-2">
        {/* 유저 이름 */}
        <CardUserId name={name} age={age} isVerified />

        {/* 위치 */}
        <CardLocation distance={distance} area={area} />

        {/* 소개 */}
        <CardDescription>{description}</CardDescription>

        {/* 키워드 */}
        <CardKeywords
          keywords={keywords}
        />

        {/* 버튼 */}
        <CardActions
          onLike={() => console.log("LIKE")}
          onChat={() => console.log("CHAT")}
        />
      </div>
    </RoundCardShell>
  );
}
