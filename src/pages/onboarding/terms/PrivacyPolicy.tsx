import TermsLayout from "./TermsLayout"

export default function PrivacyPolicy({
  onBack,
}: {
  onBack: () => void
}) {
  return (
    <TermsLayout title="개인정보처리방침" onBack={onBack}>
      개인정보처리방침 내용
    </TermsLayout>
  )
}
