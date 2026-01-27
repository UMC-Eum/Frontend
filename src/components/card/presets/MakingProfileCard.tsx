// card/presets/ProfileCard.tsx
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import { CardDescription } from "../blocks/CardDescription";
import { CardKeywords } from "../blocks/CardKeywords";
import { RoundCardShell } from "../shell/RoundCardShell";

type MakingProfileCardProps = {
  imageUrl: string;
  name: string;
  age: number;
  distance: string;
  area: string;
  description: string;
  keywords: string[];
};
export default function MakingProfileCard({
  imageUrl,
  name,
  age,
  distance,
  area,
  description,
  keywords
}: MakingProfileCardProps) {
  return (
    <RoundCardShell imageUrl={imageUrl}>
      {/* 배경 톤 다운 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* 중앙 컨텐츠 래퍼 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-white text-center">
        {/* 프로필 이미지 */}
        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/80 mb-4">
          <img
            src={imageUrl}
            alt="profile"
            className="w-full h-full object-cover"
          />
        </div>

        {/* 이름 + 나이 */}
        <div className="flex justify-center">
          <CardUserId name={name} age={age} isVerified />
        </div>

        {/* 위치 */}
        <div className="mt-1 flex justify-center opacity-90">
          <CardLocation distance={distance} area={area} />
        </div>

        {/* 자기소개 */}
        <div className="mt-4 max-w-xs">
          <CardDescription>
            {description}
          </CardDescription>
        </div>

        {/* 키워드 */}
        <div className="mt-6 flex justify-center">
          <CardKeywords
            keywords={keywords}
          />
        </div>
      </div>
    </RoundCardShell>
  );
}

