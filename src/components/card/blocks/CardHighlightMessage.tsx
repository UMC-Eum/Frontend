// card/blocks/CardHighlightMessage.tsx
interface CardHighlightMessageProps {
  text: string;
  time?: string;
}

export function CardHighlightMessage({
  text,
  time,
}: CardHighlightMessageProps) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="bg-[#62827a] backdrop-blur-md px-2 -py-1 rounded">
        <span className="text-[#64FFDA] text-[13px] font-bold tracking-wide">
          {text}
        </span>
      </div>
      {time && <span className="text-white text-[13px] font-medium opacity-90">· {time}</span>}
    </div>
  );
}
