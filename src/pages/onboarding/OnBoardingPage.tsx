import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAgreements,
  getAgreementStatus,
  updateMarketingAgreements,
} from "../../api/agreements/agreementsApi";
import {
  IAgreementItem,
  AgreementType,
} from "../../types/api/agreements/agreementsDTO";

import PermissionStep from "./steps/PermissionStep";
import AgreementSheet from "./overlays/AgreementSheet";
import ServiceTerms from "./terms/ServiceTerms";
import PrivacyPolicy from "./terms/PrivacyPolicy";
import MarketingTerms from "./terms/MarketingTerms";
import { getMyProfile } from "../../api/users/usersApi";
import AgeLimitModal from "./overlays/AgeLimitModal";
import ProfileSetupMain from "../profile-setup/ProfileSetupMain";

const DUMMY_DATA: IAgreementItem[] = [
  { agreementId: 1, body: "서비스 이용약관 상세 내용더미...", type: "POLICY" },
  {
    agreementId: 2,
    body: "개인정보 처리방침 상세 내용더미...",
    type: "PERSONAL_INFORMATION",
  },
  {
    agreementId: 3,
    body: "마케팅 수신 동의 상세 내용더미...",
    type: "MARKETING",
  },
];
const AGREEMENT_TYPE_MAP: Record<number, AgreementType> = {
  1: "POLICY",
  2: "PERSONAL_INFORMATION",
  3: "MARKETING",
};

export default function OnBoardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"checking" | "permission" | "setup">(
    "checking",
  );
  const [agreements, setAgreements] = useState<IAgreementItem[]>([]);
  const [showAgreement, setShowAgreement] = useState(false);
  const [currentTerm, setCurrentTerm] = useState<AgreementType | null>(null);
  const [showAgeLimit, setShowAgeLimit] = useState(false);

  const [checkedTerms, setCheckedTerms] = useState<
    Record<AgreementType, boolean>
  >({
    POLICY: false,
    PERSONAL_INFORMATION: false,
    MARKETING: false,
  });

  const checkPermissionAndPass = async () => {
    try {
      const cameraStatus = await navigator.permissions
        .query({ name: "camera" as any })
        .catch(() => ({ state: "prompt" }));
      const micStatus = await navigator.permissions
        .query({ name: "microphone" as any })
        .catch(() => ({ state: "prompt" }));

      const isCameraGranted = cameraStatus.state === "granted";
      const isMicGranted = micStatus.state === "granted";
      if (isCameraGranted && isMicGranted) {
        setStep("setup");
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
    navigate("/onboarding", { replace: true });
  };

  const fetchAgreementsData = async () => {
    try {
      const items = await getAgreements();
      const mappedItems = items?.map((item) => ({
        ...item,
        type:
          item.type ||
          AGREEMENT_TYPE_MAP[Number(item.agreementId)] ||
          "MARKETING",
      }));
      const finalItems =
        mappedItems && mappedItems.length > 0 ? mappedItems : DUMMY_DATA;
      setAgreements(finalItems);
    } catch (error) {
      console.error("약관 로드 실패:", error);
      setAgreements(DUMMY_DATA);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    const initializeUser = async () => {
      if (!token) {
        console.log("No token found, proceeding with default onboarding");
        await fetchAgreementsData();
        setShowAgreement(true);
        return;
      }

      try {
        const [userData, isPassed] = await Promise.all([
          getMyProfile(),
          getAgreementStatus(),
        ]);

        if (userData?.birthDate) {
          const today = new Date();
          const birthDate = new Date(userData.birthDate);

          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();

          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }

          console.log(
            `🎂 만 나이: ${age}세 / 약관 동의 여부(API): ${isPassed}`,
          );

          if (age < 50 || age > 200) {
            setShowAgreement(false);
            setShowAgeLimit(true);
            return;
          }
        }
        if (isPassed) {
          console.log("✅ 이미 약관 동의 완료 -> 권한 체크로 이동");
          setShowAgreement(false);
          await checkPermissionAndPass();
        } else {
          console.log("📝 약관 동의 필요 -> 약관 데이터 로드 및 모달 노출");
          await fetchAgreementsData();
          setShowAgreement(true);
        }
      } catch (err) {
        console.error("초기화 실패:", err);
        await fetchAgreementsData();
        setShowAgreement(true);
      }
    };

    initializeUser();
  }, []);

  const getTermContent = (type: AgreementType) => {
    return agreements.find((a) => a.type === type)?.body || "";
  };

  const handleConfirm = async () => {
    try {
      const marketingItems = agreements
        .filter((a) => a.type === "MARKETING" || a.agreementId === 3)
        .map(() => ({
          marketingAgreementId: 1,
          isAgreed: checkedTerms.MARKETING,
        }));

      await updateMarketingAgreements(marketingItems);
      setShowAgreement(false);
      await checkPermissionAndPass();
    } catch {
      setShowAgreement(false);
      await checkPermissionAndPass();
    }
  };

  if (step === "setup") {
    return <ProfileSetupMain />;
  }

  return (
    <div className="relative h-full bg-white">
      {step === "checking" && (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FC3367]"></div>
        </div>
      )}

      {showAgeLimit && <AgeLimitModal onClose={handleAgeLimitClose} />}

      {showAgreement && agreements.length > 0 && (
        <AgreementSheet
          agreements={agreements}
          checked={checkedTerms}
          onToggle={(type) =>
            setCheckedTerms((prev) => ({ ...prev, [type]: !prev[type] }))
          }
          onToggleAll={() => {
            const next = !Object.values(checkedTerms).every(Boolean);
            setCheckedTerms({
              POLICY: next,
              PERSONAL_INFORMATION: next,
              MARKETING: next,
            });
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
          onBack={() => {
            setCurrentTerm(null);
            setShowAgreement(true);
          }}
        />
      )}
      {currentTerm === "PERSONAL_INFORMATION" && (
        <PrivacyPolicy
          onBack={() => {
            setCurrentTerm(null);
            setShowAgreement(true);
          }}
        />
      )}
      {currentTerm === "MARKETING" && (
        <MarketingTerms
          content={getTermContent("MARKETING")}
          onBack={() => {
            setCurrentTerm(null);
            setShowAgreement(true);
          }}
        />
      )}

      {step === "permission" && (
        <PermissionStep onFinish={() => setStep("setup")} />
      )}
    </div>
  );
}
