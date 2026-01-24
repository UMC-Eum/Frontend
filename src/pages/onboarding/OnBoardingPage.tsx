import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// API 함수들 (경로는 본인 프로젝트에 맞게 유지하세요)
import { 
  getAgreements, 
  updateMarketingAgreements 
} from "../../api/agreements";

// 타입 불러오기
import type { 
  IAgreements 
} from "../../types/api/agreements/agreementsDTO";

import { TermType } from "./types";

import SplashStep from "./steps/SplashStep";
import LoginStep from "./steps/LoginStep";
import PermissionStep from "./steps/PermissionStep";

import AgreementSheet from "./overlays/AgreementSheet";
import AgeLimitModal from "./overlays/AgeLimitModal";

import ServiceTerms from "./terms/ServiceTerms";
import PrivacyPolicy from "./terms/PrivacyPolicy";
import MarketingTerms from "./terms/MarketingTerms";

type Step = "splash" | "login" | "permission";

// 🚨 [테스트용] 서버가 죽었거나 데이터가 없을 때 사용할 가짜 데이터
const FALLBACK_AGREEMENTS: IAgreements[] = [
  { agreementId: 991, type: "POLICY", required: true, body: "테스트용 서비스 이용약관" },
  { agreementId: 992, type: "PERSONAL_INFORMATION", required: true, body: "테스트용 개인정보 처리방침" },
  { agreementId: 993, type: "MARKETING", required: false, body: "테스트용 마케팅 수신 동의" },
];

export default function OnBoardingPage() {
  const navigate = useNavigate();

  // 서버(혹은 가짜) 데이터를 저장할 state
  const [serverAgreements, setServerAgreements] = useState<IAgreements[]>([]);
  
  const [step, setStep] = useState<Step>("splash");
  const [showAgreement, setShowAgreement] = useState(false);

  const [checkedTerms, setCheckedTerms] = useState<Record<TermType, boolean>>({
    service: false,
    privacy: false,
    marketing: false,
  });
  
  const [currentTerm, setCurrentTerm] = useState<TermType | null>(null);
  const [showAgeLimit, setShowAgeLimit] = useState(false);

  const handleBackFromTerms = () => {
    setCurrentTerm(null);
    setShowAgreement(true);
  };

  // 1. 초기 로그인/약관 상태 체크
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const hasAgreed = localStorage.getItem("hasAgreedTerms");
      if (!hasAgreed) {
        setStep("login");
        setShowAgreement(true);
      } else {
        setStep("permission");
      }
    }
  }, []);

  // 2. 약관 데이터 가져오기 (실패하면 가짜 데이터 사용)
  useEffect(() => {
    const loadAgreements = async () => {
      try {
        const items = await getAgreements();
        
        // 서버 데이터가 있으면 사용
        if (items && items.length > 0) {
          console.log("✅ 서버 약관 데이터 로드 성공:", items);
          setServerAgreements(items);
        } else {
          // 비어있으면 강제로 가짜 데이터 투입
          throw new Error("Empty Data");
        }
      } catch (error) {
        console.warn("⚠️ 서버 약관 로드 실패 (테스트 모드 발동): 가짜 데이터를 사용합니다.");
        setServerAgreements(FALLBACK_AGREEMENTS);
      }
    };
    loadAgreements();
  }, []);

  // 3. 약관 동의 처리 (에러나도 무조건 통과)
  const handleAgreementConfirm = async () => {
    try {
      const marketingItem = serverAgreements.find((item) => item.type === "MARKETING");

      if (marketingItem) {
        // 실제 API 호출 시도
        await updateMarketingAgreements([
          {
            marketingAgreementId: marketingItem.agreementId,
            isAgreed: checkedTerms.marketing,
          },
        ]);
        console.log("✅ 약관 동의 서버 전송 성공");
      }
    } catch (error) {
      // 🚨 에러가 나도 그냥 무시하고 진행 (테스트니까!)
      console.error("⚠️ 약관 전송 실패 (테스트 모드): 에러를 무시하고 다음 단계로 넘어갑니다.", error);
    } finally {
      // 성공하든 실패하든 무조건 실행되는 구역
      localStorage.setItem("hasAgreedTerms", "true");
      setCurrentTerm(null);
      setShowAgreement(false);
      setStep("permission"); // 다음 단계로 이동
    }
  };

  // AgreementSheet용 데이터 변환
  const getFormattedTerms = () => {
    const mapping = {
      POLICY: { type: "service" as TermType, title: "서비스 이용약관" },
      PERSONAL_INFORMATION: { type: "privacy" as TermType, title: "개인정보 처리방침" },
      MARKETING: { type: "marketing" as TermType, title: "마케팅 정보 수신 동의" },
    };

    return serverAgreements.map((item) => {
      const mapped = mapping[item.type];
      if (!mapped) return null;
      return {
        type: mapped.type,
        title: mapped.title,
        required: item.required,
      };
    }).filter((t): t is { type: TermType; title: string; required: boolean } => t !== null);
  };

  return (
    <>
      {step === "splash" && <SplashStep onNext={() => setStep("login")} />}

      {step === "login" && <LoginStep />}

      {showAgreement && (
        <AgreementSheet
          terms={getFormattedTerms()} // 이제 무조건 데이터가 들어감
          checked={checkedTerms}
          onToggle={(type) =>
            setCheckedTerms((prev) => ({ ...prev, [type]: !prev[type] }))
          }
          onToggleAll={() => {
            const allChecked = Object.values(checkedTerms).every(Boolean);
            setCheckedTerms({
              service: !allChecked,
              privacy: !allChecked,
              marketing: !allChecked,
            });
          }}
          onOpenTerm={(type) => {
            setShowAgreement(false);
            setCurrentTerm(type);
          }}
          onConfirm={handleAgreementConfirm} 
        />
      )}

      {currentTerm === "service" && <ServiceTerms onBack={handleBackFromTerms} />}
      {currentTerm === "privacy" && <PrivacyPolicy onBack={handleBackFromTerms} />}
      {currentTerm === "marketing" && <MarketingTerms onBack={handleBackFromTerms} />}

      {step === "permission" && (
        <PermissionStep
          onFinish={() => {
            navigate("/home");
          }}
        />
      )}

      {showAgeLimit && <AgeLimitModal onClose={() => setShowAgeLimit(false)} />}
    </>
  );
}