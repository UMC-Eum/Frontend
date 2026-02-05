// card/blocks/actions/LikeAction.tsx

interface LikeActionProps {
  isLiked: boolean; // ✅ 상태를 외부에서 받음
  onLike: () => void; // ✅ 클릭 함수도 외부에서 받음
  size?: "sm" | "base" | "md" | "lg";
  variant?: "bigIcon" | "smallIcon";
}

const sizeMap: Record<"sm" | "md" | "base" | "lg", string> = {
  sm: "w-[46px] h-[24px]",
  base: "w-[64px] h-[64px]",
  md: "w-[68px] h-[68px]",
  lg: "w-[88px] h-[88px]",
};

export default function LikeAction({
  isLiked,
  onLike,
  size = "md",
  variant = "bigIcon",
}: LikeActionProps) {
  // ✅ 좋아요 상태면 핑크색(#FC3367), 아니면 흰색
  const fillColor = isLiked ? "#FC3367" : "white";

  const containerClass = `
    ${sizeMap[size] || sizeMap.lg}
    rounded-full
    bg-white/25 backdrop-blur-sm  
    flex items-center justify-center
    z-50
    cursor-pointer
  `;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
        onLike();
      }}
      className="outline-none"
    >
      <div
        className={
          variant === "bigIcon"
            ? containerClass
            : `${containerClass} !bg-transparent`
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="23"
          height="20"
          viewBox="0 0 23 20"
          fill="none"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 6.69375C0 3.01382 2.83687 0 6.48123 0C8.3326 0 9.98466 0.783201 11.1562 2.03865C12.3278 0.783201 13.9798 0 15.8312 0C19.4755 0 22.3124 3.01382 22.3124 6.69375C22.3124 8.43617 21.6818 9.90329 20.6966 11.2652C19.7296 12.6018 18.3845 13.8849 16.9069 15.257L16.9024 15.2612L12.9291 18.9033C12.7455 19.0717 12.5692 19.2333 12.4091 19.3585C12.2332 19.4959 12.0189 19.6371 11.7466 19.7204C11.3618 19.8381 10.9506 19.8381 10.5658 19.7204C10.2935 19.6371 10.0792 19.4959 9.90335 19.3585C9.74318 19.2333 9.56699 19.0717 9.38334 18.9033L5.41007 15.2612L5.40555 15.257C3.92795 13.8849 2.5828 12.6018 1.61584 11.2652C0.630658 9.90329 0 8.43617 0 6.69375ZM6.48121 1.91229C3.9631 1.91229 1.91248 3.99847 1.91248 6.69354C1.91248 7.92613 2.34432 9.009 3.16538 10.144C4.00424 11.3036 5.20831 12.4637 6.70466 13.8532L11.0844 17.868C11.125 17.9052 11.1874 17.9053 11.228 17.868L15.6078 13.8532C17.1041 12.4637 18.3082 11.3036 19.147 10.144C19.9681 9.009 20.3999 7.92613 20.3999 6.69354C20.3999 3.99847 18.3493 1.91229 15.8312 1.91229C14.2024 1.91229 12.7841 2.77639 11.9734 4.11064C11.8 4.39607 11.4902 4.57032 11.1562 4.57032C10.8222 4.57032 10.5124 4.39607 10.339 4.11064C9.52826 2.77639 8.10995 1.91229 6.48121 1.91229Z"
            fill={fillColor}
          />
        </svg>
      </div>
    </button>
  );
}
