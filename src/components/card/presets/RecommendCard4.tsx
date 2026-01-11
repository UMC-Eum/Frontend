// card/presets/ProfileCard.tsx
import { CardShell } from "../shell/CardShell";
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import { CardDescription } from "../blocks/CardDescription";
import { CardKeywords } from "../blocks/CardKeywords";
import LikeAction from "../actions/LikeAction";
import CloseAction from "../actions/CloseAction";
import { ChatAction } from "../actions/ChatAction";

export default function RecommendCard4() {
  return (
    <CardShell imageUrl="https://picsum.photos/400/600">
      {/* 🔹 하단 전체 그라데이션 */}
      <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* 🔹 유저 정보 + 소개 + 키워드 */}
      <div className="absolute left-4 right-4 bottom-44 text-white">
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

      {/* 🔹 하단 액션 버튼 3개 (CTA 위로 올림) */}
      <div className="absolute inset-x-0 bottom-24 flex items-center justify-center gap-10 z-10">
        <CloseAction size="lg" onClose={() => console.log("닫기 클릭")} />
        <LikeAction size="lg" variant="icon" onLike={() => console.log("좋아요 클릭")} />
      </div>

      {/* 🔹 CTA 버튼 (카드 최하단) */}
      <div className="absolute left-4 right-4 bottom-4 z-10">
        <ChatAction size="lg" onChat={() => console.log("채팅 클릭")} />
      </div>
    </CardShell>
  );
}