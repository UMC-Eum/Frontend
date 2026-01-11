// card/blocks/CardHighlightMessage.tsx
interface CardHighlightMessageProps {
  text: string;
}

export function CardHighlightMessage({
  text,
}: CardHighlightMessageProps) {
  return (
    <div className="inline-block bg-[#2ED3A6] text-white text-sm px-3 py-1 rounded-full mb-2">
      {text}
    </div>
  );
}
