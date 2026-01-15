// card/presets/ProfileCard.tsx
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import { CardDescription } from "../blocks/CardDescription";
import { CardKeywords } from "../blocks/CardKeywords";
import { RoundCardShell } from "../shell/RoundCardShell";

export default function MakingProfileCard() {
  return (
    <RoundCardShell imageUrl="https://picsum.photos/400/600">
      {/* 🔹 배경 톤 다운 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* 🔹 중앙 컨텐츠 래퍼 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-white text-center">
        {/* 🔹 프로필 이미지 (이건 block 없으니 여기서만 추가) */}
        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/80 mb-4">
          <img
            src="https://picsum.photos/400/600"
            alt="profile"
            className="w-full h-full object-cover"
          />
        </div>

        {/* 🔹 이름 + 나이 */}
        <div className="flex justify-center">
          <CardUserId name="테스트유저" age={27} isVerified />
        </div>

        {/* 🔹 위치 */}
        <div className="mt-1 flex justify-center opacity-90">
          <CardLocation distance="2km" area="광주 인근" />
        </div>

        {/* 🔹 자기소개 */}
        <div className="mt-4 max-w-xs">
          <CardDescription>
            이 카드는 테스트용 IdleCard입니다.
            이 카드는 테스트용 IdleCard입니다.
          </CardDescription>
        </div>

        {/* 🔹 키워드 */}
        <div className="mt-6 flex justify-center">
          <CardKeywords
            keywords={[
              { id: 1, label: "뜨개질", category: "hobby" },
              { id: 2, label: "영화", category: "hobby" },
              { id: 3, label: "운동", category: "hobby" },
              { id: 4, label: "문화생활", category: "hobby" },
            ]}
          />
        </div>
      </div>
    </RoundCardShell>
  );
}

