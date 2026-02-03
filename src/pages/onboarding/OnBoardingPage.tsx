import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAgreements, getAgreementStatus, updateMarketingAgreements } from "../../api/agreements/agreementsApi";
import { IAgreementItem, AgreementType } from "../../types/api/agreements/agreementsDTO";

import SplashStep from "./steps/SplashStep";
import LoginStep from "./steps/LoginStep";
import PermissionStep from "./steps/PermissionStep";
import AgreementSheet from "./overlays/AgreementSheet";
import ServiceTerms from "./terms/ServiceTerms";
import PrivacyPolicy from "./terms/PrivacyPolicy";
import MarketingTerms from "./terms/MarketingTerms";
import { getMyProfile } from "../../api/users/usersApi";
import AgeLimitModal from "./overlays/AgeLimitModal";

// ... (DUMMY_DATA 및 AGREEMENT_TYPE_MAP 상수는 그대로 유지) ...
const DUMMY_DATA: IAgreementItem[] = [
  { agreementId: 1, body: "서비스 이용약관 상세 내용더미...", type: "POLICY" },
  { agreementId: 2, body: "개인정보 처리방침 상세 내용더미...", type: "PERSONAL_INFORMATION" },
  { agreementId: 3, body: "마케팅 수신 동의 상세 내용더미...", type: "MARKETING" },
];
const AGREEMENT_TYPE_MAP: Record<number, AgreementType> = {
  1: "POLICY",
  2: "PERSONAL_INFORMATION",
  3: "MARKETING",
};

export default function OnBoardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"splash" | "login" | "permission">("splash");
  const [agreements, setAgreements] = useState<IAgreementItem[]>([]);

  // hasAgreed state는 렌더링 용도 외에 로직 흐름 제어에서는 제거하거나 보조적으로 사용
  const [showAgreement, setShowAgreement] = useState(false);
  const [currentTerm, setCurrentTerm] = useState<AgreementType | null>(null);
  const [showAgeLimit, setShowAgeLimit] = useState(false);
  
  const [checkedTerms, setCheckedTerms] = useState<Record<AgreementType, boolean>>({
    POLICY: false,
    PERSONAL_INFORMATION: false,
    MARKETING: false,
  });

  // 권한 체크 함수 (기존 유지)
  const checkPermissionAndPass = async () => {
    try {
      const isNotiGranted = Notification.permission === "granted";
      // navigator.permissions.query는 일부 브라우저 호환성 문제 가능성 있음. 
      // 필요시 try-catch로 감싸거나 navigator.mediaDevices 등 다른 API 사용 고려
      const cameraStatus = await navigator.permissions.query({ name: "camera" as any }).catch(() => ({ state: 'prompt' }));
      const micStatus = await navigator.permissions.query({ name: "microphone" as any }).catch(() => ({ state: 'prompt' }));

      const isCameraGranted = cameraStatus.state === "granted";
      const isMicGranted = micStatus.state === "granted";

      if (isCameraGranted && isMicGranted && isNotiGranted) {
        navigate("/profileset", { replace: true });
      } else {
        setStep("permission");
      }
    } catch {
      setStep("permission");
    }
  };

  const handleAgeLimitClose = () => {
    localStorage.removeItem("accessToken");
    setShowAgeLimit(false);
    setStep("splash");
  };

  // 약관 데이터 가져오는 함수 (필요할 때만 호출하기 위해 분리)
  const fetchAgreementsData = async () => {
    try {
      const items = await getAgreements();
      const mappedItems = items?.map((item) => ({
        ...item,
        type: item.type || AGREEMENT_TYPE_MAP[Number(item.agreementId)] || "MARKETING"
      }));
      const finalItems = mappedItems && mappedItems.length > 0 ? mappedItems : DUMMY_DATA;
      setAgreements(finalItems);
    } catch (error) {
      console.error("약관 로드 실패:", error);
      setAgreements(DUMMY_DATA);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    // 토큰이 없으면 스플래시 유지 (혹은 로직 종료)
    if (!token) return;

    // 토큰이 있으면 로그인 단계로 간주하고 로직 시작
    setStep("login");

    const initializeUser = async () => {
      try {
        // 1. 유저 프로필과 약관 동의 여부를 먼저 가져옵니다. (병렬 처리 추천)
        const [userData, isPassed] = await Promise.all([
            getMyProfile(),
            getAgreementStatus()
        ]);
        
        // 2. 나이 검사 로직
        if (userData?.birthDate) {
          const today = new Date();
          const birthDate = new Date(userData.birthDate);

          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();

          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }

          console.log(`🎂 만 나이: ${age}세 / 약관 동의 여부(API): ${isPassed}`);

          // 나이 제한 걸림
          if (age < 50 || age > 200) {
            setShowAgreement(false);
            setShowAgeLimit(true);
            return; // 종료
          }
        }

        // 3. 약관 동의 여부 분기 처리 (여기서 state인 hasAgreed가 아닌 변수 isPassed를 사용!)
        if (isPassed) {
          // 이미 동의함 -> 권한 체크로 바로 이동
          console.log("✅ 이미 약관 동의 완료 -> 권한 체크로 이동");
          setShowAgreement(false);
          await checkPermissionAndPass();
        } else {
          // 동의 안함 -> 약관 데이터 가져오고 모달 띄우기
          console.log("📝 약관 동의 필요 -> 약관 데이터 로드 및 모달 노출");
          await fetchAgreementsData(); // 이 시점에 약관 내용을 로딩
          setShowAgreement(true);
        }

      } catch (err) {
        console.error("초기화 실패:", err);
        // 에러 시 안전하게 약관을 띄우거나, 에러 페이지로 이동
        // 여기서는 기존 로직대로 약관을 띄우도록 처리
        await fetchAgreementsData();
        setShowAgreement(true);
      }
    };

    initializeUser();
  }, []); // 의존성 배열 비움

  // ... (getTermContent, handleConfirm 및 return 문은 기존과 동일) ...
  const getTermContent = (type: AgreementType) => {
    return agreements.find((a) => a.type === type)?.body || "";
  };

  const handleConfirm = async () => {
    try {
      const marketingItems = agreements
        .filter(a => a.type === "MARKETING" || a.agreementId === 3)
        .map(() => ({
          marketingAgreementId: 1,
          isAgreed: checkedTerms.MARKETING
        }));

      await updateMarketingAgreements(marketingItems);
      setShowAgreement(false);
      await checkPermissionAndPass();

    } catch {
      setShowAgreement(false);
      await checkPermissionAndPass();
    }
  };

  return (
    <div className="relative min-h-screen bg-white">
      {step === "splash" && <SplashStep onNext={() => setStep("login")} />}
      {step === "login" && <LoginStep />}

      {showAgeLimit && (
        <AgeLimitModal onClose={handleAgeLimitClose} />
      )}

      {/* agreements가 로드되었을 때만 렌더링 */}
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
      
      {/* ... (Terms 컴포넌트들) ... */}
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