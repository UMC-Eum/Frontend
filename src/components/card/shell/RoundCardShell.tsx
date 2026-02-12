interface CardShellProps {
  imageUrl: string;
  children: React.ReactNode;
  maxwidth?: string;
  size?: string;
  onClick?: () => void;
  className?: string;
}

export function RoundCardShell({
  imageUrl,
  children,
  maxwidth = "sm",
  size = "2/3",
  onClick,
  className,
}: CardShellProps) {
  return (
    <div
      onClick={onClick}
      className={`relative w-full max-w-${maxwidth} overflow-hidden rounded-2xl shadow-lg ${className}`}
      style={{
        aspectRatio: size,
      }}
    >
      <img src={imageUrl} className="w-full h-full object-cover" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute inset-0 z-20">{children}</div>
    </div>
  );
}
