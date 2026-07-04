import { Stack } from "expo-router";

export default function ClubLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "none" }}>
      <Stack.Screen name="create" />
      <Stack.Screen name="create-complete" />
      <Stack.Screen name="detail" />
      <Stack.Screen name="manage" />
      <Stack.Screen name="manage-members" />
      <Stack.Screen name="manage-requests" />
      <Stack.Screen name="manage-settings" />
      <Stack.Screen name="meeting-create" />
      <Stack.Screen name="meeting-create-complete" />
      <Stack.Screen name="post-create" />
      <Stack.Screen name="post-detail" />
    </Stack>
  );
}
