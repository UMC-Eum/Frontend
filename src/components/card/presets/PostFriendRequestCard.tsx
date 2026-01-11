// card/presets/ProfileCard.tsx
import { CardShell } from "../shell/CardShell";
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import { CardFriendRequest } from "../blocks/CardFriendRequest";

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
      </div>

      {/* 🔹 CTA 버튼 */}
      <div className="absolute left-4 right-4 bottom-4">
        <CardFriendRequest onClick={() => console.log("친구 요청 클릭!")}/>
      </div>
    </CardShell>
  );
}
