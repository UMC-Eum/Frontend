import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * 환영 / 음성 녹음 안내 화면
 * - "반갑습니다! {이름}님"
 * - "{이름}님의 이야기를 들려주세요."
 * - 음성 녹음 기능은 디자인 미정으로 placeholder 처리
 */
export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  // TODO: 이전 단계에서 입력한 이름을 전역 상태(zustand 등)에서 가져오기
  const userName = "사용자";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 뒤로가기 */}
      <View style={styles.header}>
        <Ionicons name="chevron-back" size={28} color="#1F2937" />
      </View>

      {/* 환영 메시지 */}
      <View style={styles.messageArea}>
        <Text style={styles.title}>
          반갑습니다! {userName}님{"\n"}
          {userName}님의 이야기를 들려주세요.
        </Text>
      </View>

      {/* 음성 녹음 영역 (placeholder) */}
      <View style={styles.voiceArea}>
        <Text style={styles.placeholderText}>
          🎙️ 음성 녹음 기능{"\n"}(디자인 확정 후 구현 예정)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  messageArea: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
    lineHeight: 36,
  },
  voiceArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  placeholderText: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 24,
  },
});
