import { Stack } from "expo-router";
import React from "react";

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // 커스텀 헤더(DevBackHeader)를 쓰기 위해 기본 헤더 숨김
        animation: "none",
      }}
    >
      <Stack.Screen name="[id]" />
      <Stack.Screen name="report" />
    </Stack>
  );
}
