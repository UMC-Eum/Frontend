import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AgeRestrictionModal from "@/components/onboarding/AgeRestrictionModal";
import TermsBottomSheet from "@/components/onboarding/TermsBottomSheet";

/**
 * 로그인 화면
 * - 상단: 온보딩 일러스트 이미지
 * - 중앙: 타이틀 + 서브타이틀
 * - 하단: 카카오 로그인 이미지 버튼
 * - 모달: 나이 제한 / 이용약관
 */
export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const [showAgeModal, setShowAgeModal] = useState(false);
  const [showTermsSheet, setShowTermsSheet] = useState(false);

  // Figma 기준 프레임(412x892)을 작은 화면에서도 자연스럽게 줄여 적용한다.
  const layoutScale = Math.min(width / 412, height / 892, 1);
  const illustrationWidth = 280 * layoutScale;
  const illustrationHeight = 326 * layoutScale;

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
      <View
        style={[styles.illustrationArea, { marginTop: 221 * layoutScale }]}
      >
        {/* Figma에서 추출한 온보딩 일러스트 */}
        <Image
          source={require("@/assets/images/onboarding-background-image.png")}
          style={[
            styles.illustrationImage,
            { width: illustrationWidth, height: illustrationHeight },
          ]}
          resizeMode="contain"
        />
      </View>

      {/* 중앙: 타이틀 + 서브타이틀 */}
      <View style={styles.textArea}>
        <Text style={styles.title}>사랑, 다시 이음으로</Text>
        <Text style={styles.subtitle}>
          잊었던 설렘, 목소리로 다시 만나세요.
        </Text>
      </View>

      {/* 하단: 카카오 로그인 버튼 */}
      <View style={[styles.bottomArea, { marginTop: 112 * layoutScale }]}>
        <Pressable
          style={({ pressed }) => [
            styles.kakaoButton,
            pressed && styles.kakaoButtonPressed,
          ]}
          onPress={handleKakaoLogin}
        >
          {/* Figma에서 추출한 카카오 로그인 버튼 이미지 */}
          <Image
            source={require("@/assets/images/kakao-login-button.png")}
            style={styles.kakaoButtonImage}
            resizeMode="contain"
          />
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
    alignItems: "center",
  },
  illustrationImage: {
    width: 280,
    height: 326,
  },
  // 텍스트 영역
  textArea: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#000000",
    lineHeight: 45,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000000",
    lineHeight: 24,
  },
  // 하단 버튼 영역
  bottomArea: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  kakaoButton: {
    width: "100%",
    maxWidth: 367,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
  },
  kakaoButtonPressed: {
    opacity: 0.85,
  },
  kakaoButtonImage: {
    width: "100%",
    height: 55,
  },
});
