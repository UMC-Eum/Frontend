import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen name="splash" />
      <Stack.Screen name="login" />
      <Stack.Screen
        name="terms-detail"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="permissions"
        options={{ animation: "slide_from_right" }}
      />
    </Stack>
  );
}
