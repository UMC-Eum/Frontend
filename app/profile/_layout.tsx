import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="name" />
      <Stack.Screen name="age" />
      <Stack.Screen name="gender" />
      <Stack.Screen name="photo" />
      <Stack.Screen name="welcome" />
    </Stack>
  );
}
