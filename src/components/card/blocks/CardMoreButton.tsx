// card/blocks/CardMoreButton.tsx
interface CardMoreButtonProps {
  onClick?: () => void;
  color?: string;
  size?: number; // size can control both width/height and icon size relatively if needed, or just icon size
}

export function CardMoreButton({ onClick, color = "white", size = 24 }: CardMoreButtonProps) {
  return (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className="p-1 opacity-80 hover:opacity-100 transition-opacity"
      style={{ color }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1" 
        strokeLinecap="round"
      >
        <circle cx="12" cy="5" r="1"/>
        <circle cx="12" cy="12" r="1"/>
        <circle cx="12" cy="19" r="1"/>
      </svg>
    </button>
  );
}
