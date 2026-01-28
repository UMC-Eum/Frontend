import TermsLayout from "./TermsLayout";

export default function ServiceTerms({ onBack, content }: { onBack: () => void; content?: string; }) {
  return (
    <TermsLayout title="서비스 이용약관" onBack={onBack}>
      <div className="whitespace-pre-wrap text-[#636970]">{content}</div>
    </TermsLayout>
  );
}