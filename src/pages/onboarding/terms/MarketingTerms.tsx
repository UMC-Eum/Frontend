import TermsLayout from "./TermsLayout";

export default function MarketingTerms({ onBack, content }: { onBack: () => void; content?: string; }) {
  return (
    <TermsLayout title="마케팅 정보 수신 동의" onBack={onBack}>
      <div className="whitespace-pre-wrap text-[#636970]">{content}</div>
    </TermsLayout>
  );
}