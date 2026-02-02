// card/shell/CardShell.tsx
interface CardShellProps {
  imageUrl: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function CardShell({
  imageUrl,
  children,
  onClick,
  className,
}: CardShellProps) {
  return (
    <div
      onClick={onClick}
      className={`relative w-full h-full overflow-hidden ${className}`}
    >
      {/* 배경 이미지 */}
      <img src={imageUrl} className="w-full h-full object-cover" />

      {/* 그라데이션 (z-10) */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* children 레이어 (z-20, 전체 영역) */}
      <div className="absolute inset-0 z-20">{children}</div>
    </div>
  );
}
