// card/presets/ProfileCard.tsx
import { CardShell } from "../shell/CardShell";
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import LikeAction from "../actions/LikeAction";
import BackButton from "../../BackButton";
import VoiceAction from "../actions/VoiceActions";

export default function RecommendCardWithVoice() {
  return (
    <CardShell imageUrl="https://picsum.photos/400/600">
      {/* 🔹 하단 가독성용 그라데이션 */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />

      {/* 🔹 좌상단 뒤로가기 */}
      <div className="absolute top-4 left-4 z-10">
        <BackButton />
      </div>

      {/* 🔹 좌하단 유저 정보 */}
      <div className="absolute left-4 bottom-4 text-white z-10">
        <CardUserId name="테스트유저" age={27} isVerified />
        <div className="mt-1 text-sm opacity-90">
          <CardLocation distance="2km" area="광주 인근" />
        </div>
      </div>

      {/* 🔹 우하단 액션 (보이스 + 좋아요) */}
      <div className="absolute right-4 bottom-4 z-10 flex items-center gap-3">
        <VoiceAction
          onToggle={() => console.log("음성 듣기 클릭!")}
          size="sm"
        />

        <LikeAction
          onLike={() => console.log("좋아요 클릭")}
          size="sm"
          variant="icon"
        />
      </div>
    </CardShell>
  );
}

