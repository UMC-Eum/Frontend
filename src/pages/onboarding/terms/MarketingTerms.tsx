import TermsLayout from "./TermsLayout";

export default function MarketingTerms({
  onBack,
  content,
}: {
  onBack: () => void;
  content?: string;
}) {
  const cleanContent = content
    ? content.replace(/^"|"$/g, "").replace(/\\"/g, '"')
    : "";

  return (
    <TermsLayout title="마케팅 정보 수신 동의" onBack={onBack}>
      <div
        className="text-[#636970]"
        dangerouslySetInnerHTML={{ __html: cleanContent }}
      />
    </TermsLayout>
  );
}
