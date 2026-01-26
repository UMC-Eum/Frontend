// card/blocks/CardKeywords.tsx
import KeywordLabel from "../../keyword/KeywordLabel";

export function CardKeywords({ keywords, mode = "default" }: { keywords: string[]; mode?: "default" | "transparent" }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {keywords.map((k, i) => {
        if (mode === "transparent") {
          return <KeywordLabel key={i} keyword={k} isTransparent />;
        }
        return i < 2 ? (
          <KeywordLabel key={i} keyword={k} isActive />
        ) : (
          <KeywordLabel key={i} keyword={k} isTransparent />
        );
      })}
    </div>
  );
}