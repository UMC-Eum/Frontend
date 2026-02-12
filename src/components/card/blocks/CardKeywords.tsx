import KeywordLabel from "../../keyword/KeywordLabel";

interface CardKeywordsProps {
  keywords: string[];
  commonKeywords?: string[];
  mode?: "default" | "transparent";
}

export function CardKeywords({
  keywords,
  commonKeywords = [],
  mode = "default",
}: CardKeywordsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {keywords.map((k, i) => {
        const isCommon = commonKeywords.includes(k);

        if (mode === "transparent") {
          return <KeywordLabel key={i} keyword={k} isTransparent />;
        }
        return (
          <KeywordLabel
            key={i}
            keyword={k}
            isActive={isCommon}
            isTransparent={!isCommon}
          />
        );
      })}
    </div>
  );
}
