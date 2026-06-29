import { Redirect } from "expo-router";

import { useAuthStore } from "@/stores/authStore";

export default function Index() {
  const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isNewUser = useAuthStore((state) => state.isNewUser);
  const onboardingRequired = useAuthStore((state) => state.onboardingRequired);

  if (!isAuthInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  return (
    <Redirect
      href={onboardingRequired || isNewUser ? "/onboarding/permissions" : "/home"}
    />
  );
}
