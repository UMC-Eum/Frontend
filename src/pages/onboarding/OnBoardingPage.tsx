import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// 주신 API 함수 그대로 가져오기
import { getAgreements, updateMarketingAgreements } from "../../api/agreements/agreementsApi";
// 주신 DTO 그대로 가져오기
import { IAgreementItem, AgreementType } from "../../types/api/agreements/agreementsDTO";

import SplashStep from "./steps/SplashStep";
import LoginStep from "./steps/LoginStep";
import PermissionStep from "./steps/PermissionStep";
import AgreementSheet from "./overlays/AgreementSheet";

// 상세 페이지 컴포넌트
import ServiceTerms from "./terms/ServiceTerms";
import PrivacyPolicy from "./terms/PrivacyPolicy";
import MarketingTerms from "./terms/MarketingTerms";

// ID가 number인 주신 스펙에 맞춘 더미 데이터
const DUMMY_DATA: IAgreementItem[] = [
  { agreementId: 1, body: "서비스 이용약관 상세 내용더미...", type: "POLICY" },
  { agreementId: 2, body: "개인정보 처리방침 상세 내용더미...", type: "PERSONAL_INFORMATION" },
  { agreementId: 3, body: "마케팅 수신 동의 상세 내용더미...", type: "MARKETING" },
];

export default function OnBoardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"splash" | "login" | "permission">("splash");
  const [agreements, setAgreements] = useState<IAgreementItem[]>([]);
  const [showAgreement, setShowAgreement] = useState(false);
  const [currentTerm, setCurrentTerm] = useState<AgreementType | null>(null);
  
  const [checkedTerms, setCheckedTerms] = useState<Record<AgreementType, boolean>>({
    POLICY: false,
    PERSONAL_INFORMATION: false,
    MARKETING: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    const fetchData = async () => {
      try {
        // 주신 getAgreements 호출 (IAgreementItem[] 반환)
        const items = await getAgreements();
        
        // 데이터가 없으면 더미를 넣어 레이아웃 깨짐 방지
        const finalItems = items && items.length > 0 ? items : DUMMY_DATA;
        setAgreements(finalItems);

        // 데이터 세팅이 끝난 후 토큰이 있으면 모달 오픈
        if (token) {
          setStep("login");
          setShowAgreement(true);
        }
      } catch (error) {
        console.error("약관 로드 실패:", error);
        setAgreements(DUMMY_DATA);
        if (token) {
          setStep("login");
          setShowAgreement(true);
        }
      }
    };

    fetchData();
  }, []);

  // 상세 페이지 내용 헬퍼
  const getTermContent = (type: AgreementType) => {
    return agreements.find((a) => a.type === type)?.body || "";
  };

  const handleConfirm = async () => {
    try {
      // 주신 API 인자 형식: { marketingAgreementId: number, isAgreed: boolean }[]
      const marketingItems = agreements
        .filter(a => a.type === "MARKETING" || a.agreementId === 3)
        .map(a => ({
          marketingAgreementId: a.agreementId, // 이미 number임
          isAgreed: checkedTerms.MARKETING
        }));

      // 주신 함수 호출 (배열을 그대로 전달하면 내부에서 body로 감싸서 post함)
      await updateMarketingAgreements(marketingItems);
      
      setShowAgreement(false);
      setStep("permission");
    } catch (error) {
      setStep("permission");
      setShowAgreement(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white">
      {/* 1. 기본 스텝 렌더링 */}
      {step === "splash" && <SplashStep onNext={() => setStep("login")} />}
      {step === "login" && <LoginStep />}

      {/* 2. 약관 모달: 데이터가 로딩된(length > 0) 후에만 노출해서 디자인 깨짐 방지 */}
      {showAgreement && agreements.length > 0 && (
        <AgreementSheet
          agreements={agreements}
          checked={checkedTerms}
          onToggle={(type) => setCheckedTerms(prev => ({ ...prev, [type]: !prev[type] }))}
          onToggleAll={() => {
            const next = !Object.values(checkedTerms).every(Boolean);
            setCheckedTerms({ POLICY: next, PERSONAL_INFORMATION: next, MARKETING: next });
          }}
          onOpenTerm={(type) => {
            setShowAgreement(false);
            setCurrentTerm(type);
          }}
          onConfirm={handleConfirm}
        />
      )}

      {/* 3. 약관 상세 페이지 이동 로직 */}
      {currentTerm === "POLICY" && (
        <ServiceTerms 
          content={getTermContent("POLICY")} 
          onBack={() => { setCurrentTerm(null); setShowAgreement(true); }} 
        />
      )}
      {currentTerm === "PERSONAL_INFORMATION" && (
        <PrivacyPolicy 
          content={getTermContent("PERSONAL_INFORMATION")} 
          onBack={() => { setCurrentTerm(null); setShowAgreement(true); }} 
        />
      )}
      {currentTerm === "MARKETING" && (
        <MarketingTerms 
          content={getTermContent("MARKETING")} 
          onBack={() => { setCurrentTerm(null); setShowAgreement(true); }} 
        />
      )}

      {step === "permission" && <PermissionStep onFinish={() => navigate("/home")} />}
    </div>
  );
}