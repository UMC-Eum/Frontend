import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAgreements, updateMarketingAgreements } from "../../api/agreements/agreementsApi";
import { IAgreementItem, AgreementType } from "../../types/api/agreements/agreementsDTO";

import SplashStep from "./steps/SplashStep";
import LoginStep from "./steps/LoginStep";
import PermissionStep from "./steps/PermissionStep";
import AgreementSheet from "./overlays/AgreementSheet";
import ServiceTerms from "./terms/ServiceTerms";
import PrivacyPolicy from "./terms/PrivacyPolicy";
import MarketingTerms from "./terms/MarketingTerms";

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

  // ----------------------------------------------------------------------
  // 🔥 [새로 추가됨] 권한 상태를 확인하고 페이지를 이동시키는 함수
  // ----------------------------------------------------------------------
  const checkPermissionAndPass = async () => {
    try {
      // 1. 알림 권한 (동기적 확인)
      const isNotiGranted = Notification.permission === "granted";

      // 2. 카메라/마이크 권한 (비동기적 확인)
      // (주의: 일부 브라우저는 query 미지원이므로 try-catch로 감쌈)
      const cameraStatus = await navigator.permissions.query({ name: "camera" as any });
      const micStatus = await navigator.permissions.query({ name: "microphone" as any });

      const isCameraGranted = cameraStatus.state === "granted";
      const isMicGranted = micStatus.state === "granted";

      // 3. 판단: 필수 권한(카메라, 마이크) + 알림이 모두 있다면 바로 이동
      if (isCameraGranted && isMicGranted && isNotiGranted) {
        console.log("✅ 모든 권한 허용됨 -> 바로 프로필 설정으로 이동");
        navigate("/profileset", { replace: true });
      } else {
        // 하나라도 없으면 권한 페이지 보여주기
        console.log("❌ 권한 부족 -> 권한 설정 페이지 노출");
        setStep("permission");
      }
    } catch (error) {
      // 브라우저 호환성 문제 등으로 확인 불가 시, 안전하게 권한 페이지 보여줌
      console.log("⚠️ 권한 확인 불가 -> 권한 설정 페이지 노출");
      setStep("permission");
    }
  };
  // ----------------------------------------------------------------------

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    const fetchData = async () => {
      try {
        const items = await getAgreements();
        const finalItems = items && items.length > 0 ? items : DUMMY_DATA;
        setAgreements(finalItems);

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

  const getTermContent = (type: AgreementType) => {
    return agreements.find((a) => a.type === type)?.body || "";
  };

  const handleConfirm = async () => {
    try {
      const marketingItems = agreements
        .filter(a => a.type === "MARKETING" || a.agreementId === 3)
        .map(a => ({
          marketingAgreementId: a.agreementId,
          isAgreed: checkedTerms.MARKETING
        }));

      await updateMarketingAgreements(marketingItems);
      
      setShowAgreement(false);

      // ----------------------------------------------------------------------
      // 🔥 [수정됨] 무조건 setStep("permission") 하던 것을 함수 호출로 변경
      // ----------------------------------------------------------------------
      // setStep("permission");  <-- 기존 코드 주석 처리
      await checkPermissionAndPass(); // 권한 확인 후 이동 or 페이지 노출 결정

    } catch (error) {
      setShowAgreement(false);
      // 에러가 나더라도 다음 단계 진행 시도
      await checkPermissionAndPass();
    }
  };

  return (
    <div className="relative min-h-screen bg-white">
      {step === "splash" && <SplashStep onNext={() => setStep("login")} />}
      {step === "login" && <LoginStep />}

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

      {step === "permission" && <PermissionStep onFinish={() => navigate("/profileset")} />}
    </div>
  );
}