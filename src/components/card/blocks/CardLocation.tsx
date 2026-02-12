import locationmark from "../../../assets/card_location.svg";

interface LocationProps {
  area: string;
  showIcon?: boolean;
  textsize?: string;
  gap?: string;
}
export function CardLocation({
  area,
  showIcon = false,
  textsize = "text-sm",
  gap = "gap-1",
}: LocationProps) {
  return (
    <p
      className={`flex items-center text-white font-medium ${gap} ${textsize}`}
    >
      {showIcon && <img className="h-4 w-4" src={locationmark} />}
      <span>{area}</span>
    </p>
  );
}
