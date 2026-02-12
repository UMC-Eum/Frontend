type Shape = "round" | "pill";

interface KeywordLabelProps {
  keyword: string;

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
    round: "px-[12px] py-[4px] rounded-[7px] text-[14px]",
    pill: "px-4 py-1 rounded-full border-2 border-gray-300 text-[16px] font-medium",
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
      {keyword}
    </span>
  );
};

export default KeywordLabel;
