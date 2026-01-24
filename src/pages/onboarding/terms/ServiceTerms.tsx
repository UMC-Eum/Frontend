import TermsLayout from "./TermsLayout"

export default function ServiceTerms({
  onBack,
  content // props로 받음
}: {
  onBack: () => void;
  content?: string;
}) {
  return (
    <TermsLayout title="개인정보처리방침" onBack={onBack}>
      {/* HTML 문자열인 경우 dangerouslySetInnerHTML 사용 고려 */}
      <div className="whitespace-pre-wrap">{content}</div>
    </TermsLayout>
  )
}