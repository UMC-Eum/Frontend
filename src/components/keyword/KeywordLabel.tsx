import { Keyword } from "./keyword.model";

type Shape = "round" | "pill";

interface KeywordLabelProps {
  keyword: Keyword;
  shape?: Shape;
  isActive?: boolean;
  isTransparent?: boolean;
}

const KeywordLabel = ({
  keyword,
  shape = "round",
  isActive = false,
  isTransparent = false,
}: KeywordLabelProps) => {
  const shapeStyles: Record<Shape, string> = {
    round: "px-4 py-2 rounded-[14px]",
    pill: "px-4 py-2 rounded-full border-2 border-gray-300",
  };

  const activeStyles = isActive
    ? isTransparent
      ? "bg-[#D37287]/50 text-white"
      : "bg-[#D37287] text-white"
    : isTransparent
    ? "bg-white/25 text-white"
    : "bg-[#E9ECED] text-gray-700";
  return (
    <span
      className={`
        ${shapeStyles[shape]} 
        ${activeStyles}
      `}
    >
      {keyword.label}
    </span>
  );
};

export default KeywordLabel;
