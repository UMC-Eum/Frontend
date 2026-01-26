type Shape = "round" | "pill";

interface KeywordLabelProps {
  /** 키워드 객체 */
  keyword: string;

  /** 라벨의 모양 "round" | "pill" */
  shape?: Shape;

  /**
   * 활성화(교차) 상태 여부
   * - true: 핑크색 배경
   * - false: 회색 배경
   */
  isActive?: boolean;

  /**
   * 배경 투명도
   * - true: 반투명
   * - false: 투명 X
   */
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
    pill: "px-2 py-1 rounded-full border-2 border-gray-300 text-xs",
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
