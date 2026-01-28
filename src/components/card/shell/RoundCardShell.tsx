// card/shell/CardShell.tsx
interface CardShellProps {
  imageUrl: string;
  children: React.ReactNode;
  maxwidth?: string;
  size?: string;
  onClick?: () => void;
  className?: string;
}

export function RoundCardShell({ imageUrl, children, maxwidth="sm", size="2/3", onClick, className }: CardShellProps) {
  return (
    <div 
      onClick={onClick}
      className={`relative w-full max-w-${maxwidth} overflow-hidden rounded-2xl shadow-lg ${className}`}
      style={{
        aspectRatio: size
      }}
    >
      {/* 배경 이미지 */}
      <img src={imageUrl} className="w-full h-full object-cover" />

      {/* 그라데이션 (z-10) */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* children 레이어 (z-20, 전체 영역) */}
      <div className="absolute inset-0 z-20">
        {children}
      </div>
    </div>
  );
}
