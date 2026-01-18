// card/presets/ProfileCard.tsx
import { CardUserId } from "../blocks/CardUserId";
import { CardLocation } from "../blocks/CardLocation";
import { CardFriendRequest } from "../blocks/CardFriendRequest";
import { CardMoreButton } from "../blocks/CardMoreButton";
import { RoundCardShell } from "../shell/RoundCardShell";

type PostFriendRequestCardProps = {
  imageUrl: string;
  name: string;
  age: number;
  distance: string;
  area: string;
}
export default function PostFriendRequestCard({ imageUrl, name, age, distance, area }: PostFriendRequestCardProps) {
  return (
    <div className="w-[120px]">
      <RoundCardShell imageUrl={imageUrl} maxwidth="" size="3/5">
        <div className="flex justify-end mt-2">
          <CardMoreButton onClick={() => console.log("더보기 클릭")}/>
        </div>  
        {/* 하단 전체 그라데이션 */}
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* 유저 정보 + 소개 + 키워드 */}
        <div className="absolute left-4 right-4 bottom-16 text-white">
          <CardUserId name={name} age={age} isVerified={false} textsize="text-base" mbsize="mb-0" />

          <div className="">
            <CardLocation distance={distance} area={area} textsize="text-[10px]" gap="gap-0" />
          </div>
        </div>

        {/* CTA 버튼 */}
        <div className="absolute left-3 right-3 bottom-3">
          <CardFriendRequest onClick={() => console.log("친구 요청 클릭!")}/>
        </div>
      </RoundCardShell>
    </div>
  );
}
