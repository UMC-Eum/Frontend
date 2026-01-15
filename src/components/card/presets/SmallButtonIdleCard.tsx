// card/presets/ProfileCard.tsx
import { CardShell } from "../shell/CardShell";
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import { CardDescription } from "../blocks/CardDescription";
import { CardKeywords } from "../blocks/CardKeywords";
import { ChatAction } from "../actions/ChatAction";
import { LikeAction } from "../actions/LikeAction";
import CloseAction from "../actions/CloseAction";

export default function SmallButtonIdleCard() {
  return (
    <CardShell imageUrl="https://picsum.photos/400/600" >
      {/* 🔹 하단 그라데이션 */}
      <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* 🔹 텍스트 정보 영역 */}
      <div className="absolute left-4 right-4 bottom-28 text-white">
        <CardUserId name="테스트유저" age={27} isVerified />

        <div className="mt-1">
          <CardLocation distance="2km" area="광주 인근" />
        </div>

        <div className="mt-2">
          <CardDescription>
            이 카드는 테스트용 IdleCard입니다.
          </CardDescription>
        </div>

        <div className="mt-3">
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

      {/* 🔹 하단 액션 버튼 */}
      <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-13">
        {/* ❌ X 버튼 */}
        <CloseAction size="md" onClose={() => console.log("닫기 클릭")} />

        {/* ✈️ 채팅 */}
        <ChatAction
          onChat={() => console.log("채팅 보내기 클릭!")}
          size="lg"
        />

        {/* ❤️ 좋아요 */}
        <LikeAction
          onLike={() => console.log("좋아요 클릭!")}
          size="md"
          variant="bigIcon"
        />
      </div>
    </CardShell>
  );
}
