import TermsLayout from "./TermsLayout";

export default function PrivacyPolicy({ onBack, content }: { onBack: () => void; content?: string; }) {
  return (
    <TermsLayout title="개인정보 처리방침" onBack={onBack}>
      <div className="whitespace-pre-wrap text-[#636970]">{content}</div>
    </TermsLayout>
  );
}