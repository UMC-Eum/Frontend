import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
      }}
    >
      <Stack.Screen name="name" />
      <Stack.Screen name="photo" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="location" />
      <Stack.Screen name="welcome" />
    </Stack>
  );
}
