interface KeywordChipProps {
  keyword: string;
  isSelected: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

const KeywordChip = ({
  keyword,
  isSelected,
  disabled,
  onToggle,
}: KeywordChipProps) => (
  <button
    type="button"
    onClick={onToggle}
    disabled={disabled}
    className={`
      px-4 py-2 rounded-[14px] border
      ${
        isSelected
          ? "border-pink-500 bg-pink-50 text-pink-600"
          : "border-gray-300 bg-white text-gray-700"
      }
    `}
  >
    {keyword}
  </button>
);

export default KeywordChip;
