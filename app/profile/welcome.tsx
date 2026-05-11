import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import ProfileStepLayout from "@/components/profile/ProfileStepLayout";

/**
 * 환영 / 음성 녹음 안내 화면
 * - "반갑습니다! {이름}님"
 * - "{이름}님의 이야기를 들려주세요."
 * - 음성 녹음 기능은 디자인 미정으로 placeholder 처리
 */
export default function WelcomeScreen() {
  const router = useRouter();

  // TODO: 이전 단계에서 입력한 이름을 전역 상태(zustand 등)에서 가져오기
  const userName = "사용자";

  return (
    <ProfileStepLayout
      title={`반갑습니다! ${userName}님`}
      subtitle={`${userName}님의 이야기를 들려주세요.`}
      step={5}
      buttonText="시작하기"
      buttonEnabled
      onNext={() => router.replace("/(tabs)" as any)}
    >
      {/* 음성 녹음 영역 (placeholder) */}
      <View style={styles.voiceArea}>
        <View style={styles.voiceCircle}>
          <Ionicons name="mic" size={48} color="#FF3E70" />
        </View>
        <Text style={styles.placeholderText}>목소리로 나를 소개해보세요.</Text>
      </View>
    </ProfileStepLayout>
  );
}

const styles = StyleSheet.create({
  voiceArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  voiceCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255, 62, 112, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#636970",
    textAlign: "center",
    lineHeight: 24,
  },
});
