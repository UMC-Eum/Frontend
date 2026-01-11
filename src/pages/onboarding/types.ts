// pages/onboarding/types.ts
export type TermType = "service" | "privacy" | "marketing"

export interface OnboardingConfig {
  minAge: number
  terms: {
    type: TermType
    title: string
    required: boolean
  }[]
  permissions: {
    key: "camera" | "microphone" | "notification"
    required: boolean
    description: string
  }[]
}
