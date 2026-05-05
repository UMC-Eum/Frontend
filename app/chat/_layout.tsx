import { Stack } from "expo-router";
import React from "react";

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // 커스텀 헤더(DevBackHeader)를 쓰기 위해 기본 헤더 숨김
        animation: "slide_from_right", // 채팅방 들어갈 때 자연스러운 우측 슬라이드
      }}
    >
      <Stack.Screen name="[id]" />
      <Stack.Screen
        name="report"
        options={{ animation: "slide_from_bottom" }} // 신고하기 화면은 아래에서 위로 올라오게
      />
    </Stack>
  );
}
