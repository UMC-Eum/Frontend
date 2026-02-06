import KeywordChip from "./KeywordChip";

interface KeywordChipsProps {
  allKeywords: string[];
  selectedKeywords: string[];
  maxSelect: number;
  onChange: (keywords: string[]) => void;
}

const KeywordChips = ({
  allKeywords,
  selectedKeywords,
  maxSelect,
  onChange,
}: KeywordChipsProps) => {
  const toggle = (keyword: string) => {
    const isSelected = selectedKeywords.includes(keyword);
    if (!isSelected && selectedKeywords.length >= maxSelect) return;

    onChange(
      isSelected ? selectedKeywords.filter((v) => v !== keyword) : [...selectedKeywords, keyword]
    );
  };

  return (
    <>
      {[...new Set(allKeywords)].map((k) => {
        const isSelected = selectedKeywords.includes(k);
        const disabled = !isSelected && selectedKeywords.length >= maxSelect;

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
