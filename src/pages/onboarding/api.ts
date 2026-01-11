// pages/onboarding/api.ts
import { OnboardingConfig } from "./types"

export async function fetchOnboardingConfig(): Promise<OnboardingConfig> {
  // test용
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        minAge: 50,
        terms: [
          { type: "service", title: "서비스이용약관 동의 (필수)", required: true },
          { type: "privacy", title: "개인정보처리방침 동의 (필수)", required: true },
          { type: "marketing", title: "마케팅정보수신 동의 (선택)", required: false },
        ],
        permissions: [
          {
            key: "camera",
            required: true,
            description: "사진으로 일정 간편 등록",
          },
          {
            key: "microphone",
            required: true,
            description: "음성 매칭에 사용",
          },
          {
            key: "notification",
            required: true,
            description: "새 인연 알림",
          },
        ],
      })
    }, 500)
  })
}
