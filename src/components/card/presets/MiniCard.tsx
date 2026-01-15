// card/presets/ProfileCard.tsx
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import LikeAction from "../actions/LikeAction";
import { RoundCardShell } from "../shell/RoundCardShell";

export default function MiniCard() {
  return (
    <div className="flex w-[173px]">
      <RoundCardShell imageUrl="https://picsum.photos/400/600">
        {/* 🔹 하단 가독성용 그라데이션 */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />

        {/* 🔹 좋아요 버튼 (우상단) */}
        <div className="absolute top-3 right-3 shrink-0">
          <LikeAction
            onLike={() => console.log("좋아요 클릭!")}
            size="sm"
            variant="smallIcon"
          />
        </div>

        {/* 🔹 이름 + 위치 (좌하단) */}
        <div className="absolute left-4 bottom-2 text-white">
          <CardUserId name="테스트유저" age={27} isVerified={false} textsize="[18px]" bold="semi-bold" />

          <div className="-mt-3">
            <CardLocation distance="2km" area="광주 인근" textsize="text-[14px]" />
          </div>
        </div>
      </RoundCardShell>
    </div>
  );
}
