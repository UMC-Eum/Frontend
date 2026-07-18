import { Redirect } from "expo-router";

import { useAuthStore } from "@/stores/authStore";
import { useOnboardingDraftStore } from "@/stores/onboardingDraftStore";

export default function Index() {
  const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const onboardingRequired = useAuthStore((state) => state.onboardingRequired);
  const vibeVector = useOnboardingDraftStore((state) => state.vibeVector);

  if (!isAuthInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  // 온보딩 대상(신규/미완료)인데 음성분석(vibeVector)까지 마치지 못했으면 홈 진입을 막는다.
  // vibeVector는 보조 기준 — 기존 가입자(플래그 false)는 vibeVector가 없어도 홈으로 간다.
  const needsOnboarding = onboardingRequired && vibeVector.length === 0;

  return (
    <Redirect href={needsOnboarding ? "/onboarding/permissions" : "/(tabs)"} />
  );
}
