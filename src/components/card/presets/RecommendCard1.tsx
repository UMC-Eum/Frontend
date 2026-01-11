// card/presets/ProfileCard.tsx
import { CardShell } from "../shell/CardShell";
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import { CardDescription } from "../blocks/CardDescription";
import { CardKeywords } from "../blocks/CardKeywords";
import { CardRecommend } from "../blocks/CardRecommend";

export default function RecommendCard() {
  return (
    <CardShell imageUrl="https://picsum.photos/400/600">
      {/* 🔹 하단 전체 그라데이션 */}
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* 🔹 유저 정보 + 소개 + 키워드 */}
      <div className="absolute left-4 right-4 bottom-24 text-white">
        <CardUserId name="김철수" age={67} isVerified />

        <div className="mt-1">
          <CardLocation distance="14km" area="서울 인근" />
        </div>

        <div className="mt-2">
          <CardDescription>
            어쩌구 저쩌구 한줄소개
          </CardDescription>
        </div>

        <div className="mt-3">
          <CardKeywords
            keywords={[
              { id: 1, label: "영화보기", category: "hobby" },
              { id: 2, label: "등산", category: "hobby" },
              { id: 3, label: "게임하기", category: "hobby" },
              { id: 4, label: "조용한 성격", category: "character" },
            ]}
          />
        </div>
      </div>

      {/* 🔹 CTA 버튼 */}
      <div className="absolute left-4 right-4 bottom-4">
        <CardRecommend
          onClick={() => console.log("프로필 보러가기 클릭")}
        />
      </div>
    </CardShell>
  );
}
