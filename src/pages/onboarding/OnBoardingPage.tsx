import { useEffect, useState } from "react";
import { fetchOnboardingConfig } from "./api";
import { OnboardingConfig, TermType } from "./types";
import { useNavigate } from "react-router-dom";
import SplashStep from "./steps/SplashStep";
import LoginStep from "./steps/LoginStep";
import PermissionStep from "./steps/PermissionStep";

import AgreementSheet from "./overlays/AgreementSheet";
import AgeLimitModal from "./overlays/AgeLimitModal";

import ServiceTerms from "./terms/ServiceTerms";
import PrivacyPolicy from "./terms/PrivacyPolicy";
import MarketingTerms from "./terms/MarketingTerms";

type Step = "splash" | "login" | "permission";

export default function OnBoardingPage() {
  const navigate = useNavigate();

  const [config, setConfig] = useState<OnboardingConfig | null>(null);

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

  // 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // 이미 로그인된 경우 권한 단계로 이동
      setStep("permission");
    }
  }, []);

  useEffect(() => {
    fetchOnboardingConfig().then(setConfig);
  }, []);

  if (!config) return null;

  return (
    <>
      {/* Splash */}
      {step === "splash" && <SplashStep onNext={() => setStep("login")} />}

      {/* Login 단계 */}
      {step === "login" && <LoginStep />}

      {/* 🔥 Agreement는 overlay */}
      {showAgreement && (
        <AgreementSheet
          terms={config.terms}
          checked={checkedTerms}
          onToggle={(type) =>
            setCheckedTerms((prev) => ({
              ...prev,
              [type]: !prev[type],
            }))
          }
          onToggleAll={() => {
            const next = !Object.values(checkedTerms).every(Boolean);
            setCheckedTerms({
              service: next,
              privacy: next,
              marketing: next,
            });
          }}
          onOpenTerm={(type) => {
            setShowAgreement(false);
            setCurrentTerm(type);
          }}
          onConfirm={() => {
            setCurrentTerm(null);
            setShowAgreement(false);
            setStep("permission");
          }}
        />
      )}

      {/* Terms도 overlay */}
      {currentTerm === "service" && (
        <ServiceTerms onBack={handleBackFromTerms} />
      )}
      {currentTerm === "privacy" && (
        <PrivacyPolicy onBack={handleBackFromTerms} />
      )}
      {currentTerm === "marketing" && (
        <MarketingTerms onBack={handleBackFromTerms} />
      )}

      {/* Permission */}
      {step === "permission" && (
        <PermissionStep
          onFinish={() => {
            console.log("온보딩 완료");
            navigate("/home");
          }}
        />
      )}

      {/* Age Limit */}
      {showAgeLimit && <AgeLimitModal onClose={() => setShowAgeLimit(false)} />}
    </>
  );
}
