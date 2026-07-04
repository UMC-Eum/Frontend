import { Stack } from "expo-router";

export default function ClubLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "none" }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="create" />
      <Stack.Screen name="create-complete" />
      <Stack.Screen name="detail" />
      <Stack.Screen name="post-create" />
      <Stack.Screen name="post-detail" />
    </Stack>
  );
}
