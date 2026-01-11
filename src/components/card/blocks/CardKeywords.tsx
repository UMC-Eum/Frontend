// card/blocks/CardKeywords.tsx
import { Keyword } from "../../keyword/keyword.model";
import KeywordLabel from "../../keyword/KeywordLabel";

export function CardKeywords({ keywords }: { keywords: Keyword[] }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {keywords.map((k, i) =>
        i < 2 ? (
          <KeywordLabel key={i} keyword={k} isActive />
        ) : (
          <KeywordLabel key={i} keyword={k} isTransparent />
        )
      )}
    </div>
  );
}