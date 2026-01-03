import TermsLayout from "./TermsLayout"

export default function ServiceTerms({
  onBack,
}: {
  onBack: () => void
}) {
  return (
    <TermsLayout title="서비스 이용약관" onBack={onBack}>
      서비스 이용약관 내용
    </TermsLayout>
  )
}
