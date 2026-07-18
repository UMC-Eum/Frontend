import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
      }}
    >
      <Stack.Screen name="splash" />
      <Stack.Screen name="login" />
      <Stack.Screen name="email-login" />
      <Stack.Screen name="terms-detail" />
      <Stack.Screen name="permissions" />
    </Stack>
  );
}
