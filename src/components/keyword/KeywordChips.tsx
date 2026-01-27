import KeywordChip from "./KeywordChip";

interface KeywordChipsProps {
  keywords: string[];
  maxSelect: number;
  onChange: (keywords: string[]) => void;
}

const KeywordChips = ({
  keywords,
  maxSelect,
  onChange,
}: KeywordChipsProps) => {
  const toggle = (keyword: string) => {
    const isSelected = keywords.includes(keyword);
    if (!isSelected && keywords.length >= maxSelect) return;

    onChange(
      isSelected ? keywords.filter((v) => v !== keyword) : [...keywords, keyword]
    );
  };

  return (
    <>
      {keywords.map((k) => {
        const isSelected = keywords.includes(k);
        const disabled = !isSelected && keywords.length >= maxSelect;

        return (
          <KeywordChip
            key={k}
            keyword={k}
            isSelected={isSelected}
            disabled={disabled}
            onToggle={() => toggle(k)}
          />
        );
      })}
    </>
  );
};

export default KeywordChips;
