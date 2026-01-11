// card/blocks/CardUserId.tsx
import cerficationmark from "../../../assets/card_cerfication.svg";

interface UserIdProps {
  name: string;
  age: number;
  isVerified?: boolean;

  /** 추가 */
  profileImageUrl?: string;   // 이미지 URL
  showProfileImage?: boolean; // 활성화 여부
}

export function CardUserId({
  name,
  age,
  isVerified,
  profileImageUrl,
  showProfileImage = false,
}: UserIdProps) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {/* ✅ 프로필 이미지 (선택) */}
      {showProfileImage && profileImageUrl && (
        <img
          src={profileImageUrl}
          alt="프로필 이미지"
          className="w-8 h-8 rounded-full object-cover"
        />
      )}

      {/* 이름 + 나이 */}
      <h2 className="text-2xl font-bold">
        {name} {age}
      </h2>

      {/* 인증 마크 */}
      {isVerified && <img src={cerficationmark} />}
    </div>
  );
}