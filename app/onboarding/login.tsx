import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as AppleAuthentication from "expo-apple-authentication";
import React, { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import TermsBottomSheet from "@/components/onboarding/TermsBottomSheet";
import { useSocialLogin } from "@/hooks/useSocialLogin";

/**
 * 로그인 화면
 * - 상단: 온보딩 일러스트 이미지
 * - 중앙: 타이틀 + 서브타이틀
 * - 하단: 소셜 로그인 버튼 + 아이디 로그인(심사용 임시)
 * - 모달: 나이 제한 / 이용약관
 */
export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ showTerms?: string }>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const [showTermsSheet, setShowTermsSheet] = useState(false);

  const {
    handleKakaoLogin,
    handleAppleLogin,
    isLoginPending,
    errorMessage,
    isAppleAuthAvailable,
  } = useSocialLogin({ onShowTerms: () => setShowTermsSheet(true) });

  useEffect(() => {
    if (params.showTerms === "1") {
      setShowTermsSheet(true);
    }
  }, [params.showTerms]);

  // Figma 기준 프레임(412x892)을 작은 화면에서도 자연스럽게 줄여 적용한다.
  const layoutScale = Math.min(width / 412, height / 892, 1);
  const illustrationWidth = 280 * layoutScale;
  const illustrationHeight = 326 * layoutScale;
  const bottomMarginTop = (isAppleAuthAvailable ? 48 : 112) * layoutScale;

  // 이용약관 확인 후 → 앱 접근 권한 안내로 이동
  const handleTermsConfirm = () => {
    setShowTermsSheet(false);
    router.replace("/onboarding/permissions" as any);
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

      {/* 하단: 소셜 로그인 버튼 */}
      <View style={[styles.bottomArea, { marginTop: bottomMarginTop }]}>
        <Pressable
          style={({ pressed }) => [
            styles.socialButton,
            styles.kakaoLoginButton,
            isLoginPending && styles.socialButtonDisabled,
            pressed && !isLoginPending && styles.socialButtonPressed,
          ]}
          onPress={handleKakaoLogin}
          disabled={isLoginPending}
          accessibilityRole="button"
          accessibilityLabel="카카오로 시작하기"
        >
          <View style={styles.socialButtonContent}>
            <Image
              source={require("@/assets/images/kakao-login-symbol.png")}
              style={styles.kakaoSymbol}
              resizeMode="contain"
            />
            <Text style={[styles.socialButtonText, styles.kakaoButtonText]}>
              카카오로 시작하기
            </Text>
          </View>
        </Pressable>
        {isAppleAuthAvailable ? (
          // Apple 심사 4.8/HIG: Apple 로그인은 공식 버튼 컴포넌트를 사용해야 한다.
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
            }
            buttonStyle={
              AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={12}
            style={[styles.socialButton, styles.appleButton]}
            onPress={handleAppleLogin}
          />
        ) : null}
        {/* ponytail: 심사용 임시 아이디(로컬) 로그인 진입점. 심사 종료 후 제거 (EUM-191) */}
        <Pressable
          style={({ pressed }) => [
            styles.socialButton,
            styles.emailLoginButton,
            isLoginPending && styles.socialButtonDisabled,
            pressed && !isLoginPending && styles.socialButtonPressed,
          ]}
          onPress={() => router.push("/onboarding/email-login" as any)}
          disabled={isLoginPending}
          accessibilityRole="button"
          accessibilityLabel="아이디로 시작하기"
        >
          <View style={styles.socialButtonContent}>
            <Ionicons name="person-outline" size={24} color="#111111" />
            <Text style={[styles.socialButtonText, styles.emailButtonText]}>
              아이디로 시작하기
            </Text>
          </View>
        </Pressable>
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
      </View>

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
  socialButton: {
    width: "100%",
    maxWidth: 372,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  socialButtonPressed: {
    opacity: 0.85,
  },
  socialButtonDisabled: {
    opacity: 0.6,
  },
  kakaoLoginButton: {
    backgroundColor: "#FEE500",
  },
  appleButton: {
    marginTop: 12,
  },
  emailLoginButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DEE3E5",
    marginTop: 12,
  },
  socialButtonContent: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  socialButtonText: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    includeFontPadding: false,
  },
  kakaoSymbol: {
    width: 20,
    height: 20,
  },
  kakaoButtonText: {
    color: "rgba(0, 0, 0, 0.85)",
  },
  emailButtonText: {
    color: "rgba(0, 0, 0, 0.85)",
  },
  errorText: {
    marginTop: 12,
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});
