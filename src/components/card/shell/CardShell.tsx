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
      <img src={imageUrl} className="w-full h-full object-cover" />

      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      <div className="absolute inset-0 z-20">{children}</div>
    </div>
  );
}
