// card/actions/CloseAction.tsx
interface CloseActionProps {
  onClose?: () => void;
  size?: "sm" | "md" | "lg";
}

export default function CloseButton({ onClose, size = 'lg' }: CloseActionProps) {
  // 아까 SVG 크기(68px)를 'lg'로 정의
  const sizeMap = {
    sm: 'w-[64px] h-[64px]',
    md: 'w-[68px] h-[68px]',
    lg: 'w-[88px] h-[88px]', 
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // 클릭이 부모로 전파되는 것 방지
        onClose?.();
      }}
      className={`
        ${sizeMap[size] || sizeMap.lg}
        rounded-full
        bg-white/25 backdrop-blur-sm  
        flex items-center justify-center
        z-50
      `}
      aria-label="닫기"
    >
      {/* 🔹 내부 아이콘 (아까 그 X 경로만 가져옴) */}
      <svg 
        width="26" 
        height="26" 
        viewBox="0 0 26 26" 
        fill="none"
        className="pointer-events-none" // 아이콘이 클릭 방해하지 않게 설정
      >
        <path 
          d="M19.2713 4.62695C19.6498 4.22486 20.2832 4.20568 20.6854 4.58398C21.0875 4.96248 21.1068 5.59587 20.7284 5.99805L14.3729 12.75L20.7284 19.502C21.1068 19.9041 21.0875 20.5375 20.6854 20.916C20.2832 21.2945 19.6498 21.2752 19.2713 20.873L12.9998 14.209L6.72836 20.873C6.34987 21.2752 5.71648 21.2945 5.3143 20.916C4.9123 20.5375 4.89292 19.9041 5.27133 19.502L11.6268 12.75L5.27133 5.99805C4.89303 5.59586 4.9122 4.96243 5.3143 4.58398C5.71643 4.20558 6.34985 4.22495 6.72836 4.62695L12.9998 11.29L19.2713 4.62695Z" 
          fill="white"
        />
      </svg>
    </button>
  );
}