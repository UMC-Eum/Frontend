// card/presets/ProfileCard.tsx
import { CardShell } from "../shell/CardShell";
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import { CardDescription } from "../blocks/CardDescription";
import { CardKeywords } from "../blocks/CardKeywords";
import { CardActions } from "../actions/CardActions";

export default function IdleCard() {
  return (
    <CardShell imageUrl="https://picsum.photos/400/600">
      {/* 하단 가독성용 그라데이션 */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/80 to-transparent" />

      {/* 하단 콘텐츠 영역 */}
      <div className="absolute inset-x-4 bottom-4 text-white z-10 space-y-2">
        {/* 유저 이름 */}
        <CardUserId name="parkjun2" age={55} isVerified />

        {/* 위치 */}
        <CardLocation distance="7km" area="분당 인근" />

        {/* 소개 */}
        <CardDescription>
          안녕하세요. 특별한 사람이라기보다는…
        </CardDescription>

        {/* 키워드 */}
        <CardKeywords
          keywords={[
            { id: 1, label: "음악감상", category: "hobby" },
            { id: 2, label: "근처에 사는", category: "location" },
            { id: 3, label: "게임하기", category: "hobby" },
            { id: 4, label: "조용한 성격", category: "character" },
          ]}
        />

        {/* 버튼 */}
        <CardActions
          onLike={() => console.log("LIKE")}
          onChat={() => console.log("CHAT")}
        />
      </div>
    </CardShell>
  );
}
