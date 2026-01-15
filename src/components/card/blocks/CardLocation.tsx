// card/blocks/CardMeta.tsx
import locationmark from "../../../assets/card_location.svg";

interface LocationProps {
  distance : string,
  area : string,
  showIcon?: boolean; // 추가
  textsize?: string;
  gap?: string;
}
export function CardLocation({ distance, area, showIcon = false, textsize = "text-sm", gap = "gap-1" }: LocationProps ) {
  return (
    <p className={`flex items-center text-white font-medium ${gap} ${textsize}`}>
      {showIcon && <img className="h-4 w-4" src={locationmark} />}
      <span>{area}</span>
      {distance && (
        <>
          <span className="w-[3px] h-[3px] rounded-full bg-white mx-1" />
          <span>{distance}</span>
        </>
      )}
    </p>
  );
}
