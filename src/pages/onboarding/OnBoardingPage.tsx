import { useEffect, useState } from "react"
import { fetchOnboardingConfig } from "./api"
import { OnboardingConfig, TermType } from "./types"

import SplashStep from "./steps/SplashStep"
import LoginStep from "./steps/LoginStep"
import PermissionStep from "./steps/PermissionStep"

import AgreementSheet from "./overlays/AgreementSheet"
import AgeLimitModal from "./overlays/AgeLimitModal"

import ServiceTerms from "./terms/ServiceTerms"
import PrivacyPolicy from "./terms/PrivacyPolicy"
import MarketingTerms from "./terms/MarketingTerms"

type Step = "splash" | "login" | "permission"

export default function OnBoardingPage() {
  const [config, setConfig] = useState<OnboardingConfig | null>(null)

  const [step, setStep] = useState<Step>("splash")

  const [showAgreement, setShowAgreement] = useState(false)

  const [checkedTerms, setCheckedTerms] = useState<Record<TermType, boolean>>({
  service: false,
  privacy: false,
  marketing: false,
})
  const [currentTerm, setCurrentTerm] = useState<TermType | null>(null)

  const [showAgeLimit, setShowAgeLimit] = useState(false)

  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    camera: false,
    microphone: false,
    notification: false,
  })

  const handleBackFromTerms = () => {
  setCurrentTerm(null)
  setShowAgreement(true)
}

  useEffect(() => {
    fetchOnboardingConfig().then(setConfig)
  }, [])

  if (!config) return null

  return (
    <>
      {/* Splash */}
      {step === "splash" && (
        <SplashStep onNext={() => setStep("login")} />
      )}

      {/* 🔥 Login은 agreement 중에도 계속 유지 */}
      {step === "login" && (
        <LoginStep
          onLoginSuccess={(user) => {
            if (user.age < config.minAge) {
              setShowAgeLimit(true)
            } else {
              setShowAgreement(true) 
            }
          }}
        />
      )}

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
            const next = !Object.values(checkedTerms).every(Boolean)
            setCheckedTerms({
              service: next,
              privacy: next,
              marketing: next,
            })
          }}
          onOpenTerm={(type) => {
            setShowAgreement(false)
            setCurrentTerm(type)
          }}
          onConfirm={() => {
            setCurrentTerm(null)
            setShowAgreement(false)
            setStep("permission")
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
          permissions={permissions}
          onToggle={(key) =>
            setPermissions((prev) => ({
              ...prev,
              [key]: !prev[key],
            }))
          }
          onFinish={() => {
            console.log("권한 상태:", permissions)
            alert("온보딩 완료")
          }}
        />
      )}

      {/* Age Limit */}
      {showAgeLimit && (
        <AgeLimitModal onClose={() => setShowAgeLimit(false)} />
      )}
    </>
  )
}
