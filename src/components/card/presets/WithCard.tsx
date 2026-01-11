// card/presets/ProfileCard.tsx
import { CardShell } from "../shell/CardShell";
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import { CardDescription } from "../blocks/CardDescription";
import { CardWithButton } from "../actions/CardWithButton";
import { CardHighlightMessage } from "../blocks/CardHighlightMessage";

export default function IdleCard() {
  return (
    <CardShell imageUrl="https://picsum.photos/400/600">
      {/* 🔹 상단 영역: 프로필 이미지 + 이름/나이 + 거리 */}
      <div className="absolute top-4 left-4 right-4 text-white z-20">
        <CardUserId
          name="테스트유저"
          age={27}
          isVerified
          profileImageUrl="https://picsum.photos/80"
          showProfileImage 
        />

        <CardLocation distance="2km" area="광주 인근" />
      </div>

      {/* 🔹 설명 영역 */}
      <div className="absolute left-4 right-4 bottom-32 text-white">
        <CardDescription>
          이 카드는 테스트용 IdleCard입니다.
        </CardDescription>

        <div className="mt-3">
          <CardHighlightMessage text="간단한 자기소개들입니다." />
        </div>
      </div>

      {/* 🔹 하단 CTA */}
      <div className="absolute left-4 right-4 bottom-4">
        <CardWithButton
          label="같이 할래요?"
          onClick={() => console.log("같이 하기 클릭!")}
        />
      </div>
    </CardShell>
  );
}
