// card/blocks/CardPrimaryAction.tsx
interface CardWithButton {
  label: string;
  onClick: () => void;
}

export function CardWithButton({
  label,
  onClick,
}: CardWithButton) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="
        w-full h-14 bg-[#6ED6FF] text-white
        rounded-xl text-lg font-semibold
      "
    >
      {label}
    </button>
  );
}
