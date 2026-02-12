import TermsLayout from "./TermsLayout";

export default function MarketingTerms({ onBack, content }: { onBack: () => void; content?: string; }) {
  
  // 🔥 [핵심] 백엔드에서 보낸 문자열 정제 (Cleaning)
  // 1. .replace(/^"|"$/g, '') : 맨 앞(^)과 맨 뒤($)의 따옴표(") 제거
  // 2. .replace(/\\"/g, '"')  : 혹시 style=\"...\" 처럼 이스케이프 된 따옴표가 있다면 정상적인 "로 변경
  const cleanContent = content 
    ? content.replace(/^"|"$/g, '').replace(/\\"/g, '"') 
    : "";

  return (
    <TermsLayout title="마케팅 정보 수신 동의" onBack={onBack}>
      <div 
        className="text-[#636970]" 
        // 🔥 정제된 HTML을 넣어줍니다.
        dangerouslySetInnerHTML={{ __html: cleanContent }}
      />
    </TermsLayout>
  );
}