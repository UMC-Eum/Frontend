import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AgeRestrictionModal from "@/components/onboarding/AgeRestrictionModal";
import TermsBottomSheet from "@/components/onboarding/TermsBottomSheet";

/**
 * 로그인 화면
 * - 상단: 일러스트 placeholder (핑크 원형)
 * - 중앙: 타이틀 + 서브타이틀
 * - 하단: 카카오 로그인 버튼
 * - 모달: 나이 제한 / 이용약관
 */
export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [showAgeModal, setShowAgeModal] = useState(false);
  const [showTermsSheet, setShowTermsSheet] = useState(false);

  // 카카오 로그인 버튼 클릭 시
  const handleKakaoLogin = () => {
    // TODO: 실제 카카오 로그인 API 연동
    // 나이 체크 후 분기:
    // - 50세 미만 → setShowAgeModal(true)
    // - 50세 이상 → setShowTermsSheet(true)

    // 현재는 바로 이용약관 표시 (개발용)
    setShowTermsSheet(true);
  };

  // 이용약관 확인 후 → 앱 접근 권한 안내로 이동
  const handleTermsConfirm = () => {
    setShowTermsSheet(false);
    router.push("/onboarding/permissions" as any);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
      {/* 상단: 일러스트 영역 */}
      <View style={styles.illustrationArea}>
        {/* 일러스트 placeholder — 나중에 Image 컴포넌트로 교체 */}
        <View style={styles.illustrationCircle}>
          <View style={styles.illustrationPlaceholder}>
            <Text style={styles.illustrationEmoji}>👫</Text>
          </View>
        </View>
      </View>

      {/* 중앙: 타이틀 + 서브타이틀 */}
      <View style={styles.textArea}>
        <Text style={styles.title}>사랑, 다시 이음으로</Text>
        <Text style={styles.subtitle}>
          잊었던 설렘, 목소리로 다시 만나세요.
        </Text>
      </View>

      {/* 하단: 카카오 로그인 버튼 */}
      <View style={styles.bottomArea}>
        <Pressable
          style={({ pressed }) => [
            styles.kakaoButton,
            pressed && styles.kakaoButtonPressed,
          ]}
          onPress={handleKakaoLogin}
        >
          <Text style={styles.kakaoIcon}>💬</Text>
          <Text style={styles.kakaoButtonText}>카카오 로그인</Text>
        </Pressable>
      </View>

      {/* 나이 제한 모달 */}
      <AgeRestrictionModal
        visible={showAgeModal}
        onClose={() => setShowAgeModal(false)}
      />

      {/* 이용약관 바텀시트 */}
      <TermsBottomSheet
        visible={showTermsSheet}
        onConfirm={handleTermsConfirm}
        onClose={() => setShowTermsSheet(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  // 상단 일러스트 영역
  illustrationArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  illustrationCircle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#FFE0E8",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  illustrationPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  illustrationEmoji: {
    fontSize: 80,
  },
  // 텍스트 영역
  textArea: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },
  // 하단 버튼 영역
  bottomArea: {
    paddingHorizontal: 24,
  },
  kakaoButton: {
    flexDirection: "row",
    height: 54,
    backgroundColor: "#FEE500",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  kakaoButtonPressed: {
    opacity: 0.85,
  },
  kakaoIcon: {
    fontSize: 20,
  },
  kakaoButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(0, 0, 0, 0.85)",
  },
});
