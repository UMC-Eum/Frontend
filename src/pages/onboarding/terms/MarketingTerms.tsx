import TermsLayout from "./TermsLayout"

export default function MarketingTerms({
  onBack,
}: {
  onBack: () => void
}) {
  return (
    <TermsLayout title="마케팅 정보 수신" onBack={onBack}>
      마케팅 정보 수신 약관 내용
    </TermsLayout>
  )
}
