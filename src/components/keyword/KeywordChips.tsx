import { Keyword } from "./keyword.model";
import KeywordChip from "./KeywordChip";

interface KeywordChipsProps {
  keywords: Keyword[];
  selectedIds: number[];
  maxSelect: number;
  onChange: (ids: number[]) => void;
}

const KeywordChips = ({
  keywords,
  selectedIds,
  maxSelect,
  onChange,
}: KeywordChipsProps) => {
  const toggle = (id: number) => {
    const isSelected = selectedIds.includes(id);
    if (!isSelected && selectedIds.length >= maxSelect) return;

    onChange(
      isSelected ? selectedIds.filter((v) => v !== id) : [...selectedIds, id]
    );
  };

  return (
    <>
      {keywords.map((k) => {
        const isSelected = selectedIds.includes(k.id);
        const disabled = !isSelected && selectedIds.length >= maxSelect;

        return (
          <KeywordChip
            key={k.id}
            keyword={k}
            isSelected={isSelected}
            disabled={disabled}
            onToggle={() => toggle(k.id)}
          />
        );
      })}
    </>
  );
};

export default KeywordChips;
