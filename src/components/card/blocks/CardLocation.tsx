// card/blocks/CardMeta.tsx
import locationmark from "../../../assets/card_location.svg";

interface LocationProps {
  distance : string,
  area : string
}
export function CardLocation({ distance, area }: LocationProps ) {
  return (
    <p className="flex items-center text-sm opacity-90 mb-2 gap-1">
  <img className="h-4 w-4" src={locationmark} />

  <span>{area}</span>

  <span className="w-[2px] h-[2px] rounded-full bg-white" />

  <span>{distance}</span>
</p>

  );
}
