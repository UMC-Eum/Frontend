import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getAgreementStatus } from "@/api/agreements/agreementsApi";
import AgeRestrictionModal from "@/components/onboarding/AgeRestrictionModal";
import TermsBottomSheet from "@/components/onboarding/TermsBottomSheet";
import {
  KAKAO_AUTH_URL,
  KAKAO_REDIRECT_URI,
  KAKAO_REST_API_KEY,
} from "@/constants/auth";
import {
  useAppleLoginMutation,
  useKakaoLoginMutation,
} from "@/hooks/api/useAuth";

const isIos = Platform.OS === "ios";

function getUrlParam(url: string, name: string) {
  return new URL(url).searchParams.get(name);
}

/**
 * 로그인 화면
 * - 상단: 온보딩 일러스트 이미지
 * - 중앙: 타이틀 + 서브타이틀
 * - 하단: 소셜 로그인 버튼
 * - 모달: 나이 제한 / 이용약관
 */
export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ showTerms?: string }>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const appleLoginMutation = useAppleLoginMutation();
  const kakaoLoginMutation = useKakaoLoginMutation();

  const [showAgeModal, setShowAgeModal] = useState(false);
  const [showTermsSheet, setShowTermsSheet] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOpeningBrowser, setIsOpeningBrowser] = useState(false);
  const [isAppleAuthAvailable, setIsAppleAuthAvailable] = useState(false);

  useEffect(() => {
    if (params.showTerms === "1") {
      setShowTermsSheet(true);
    }
  }, [params.showTerms]);

  useEffect(() => {
    if (!isIos) return;

    let isMounted = true;

    AppleAuthentication.isAvailableAsync()
      .then((isAvailable) => {
        if (isMounted) setIsAppleAuthAvailable(isAvailable);
      })
      .catch(() => {
        if (isMounted) setIsAppleAuthAvailable(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Figma 기준 프레임(412x892)을 작은 화면에서도 자연스럽게 줄여 적용한다.
  const layoutScale = Math.min(width / 412, height / 892, 1);
  const illustrationWidth = 280 * layoutScale;
  const illustrationHeight = 326 * layoutScale;
  const bottomMarginTop = (isAppleAuthAvailable ? 48 : 112) * layoutScale;

  const finishLogin = async (auth: {
    isNewUser: boolean;
    onboardingRequired: boolean;
  }) => {
    const needsOnboarding = auth.onboardingRequired || auth.isNewUser;

    if (needsOnboarding) {
      const hasPassedAgreements = await getAgreementStatus();

      if (hasPassedAgreements) {
        router.replace("/onboarding/permissions" as any);
        return;
      }

      setShowTermsSheet(true);
      return;
    }

    router.replace("/(tabs)" as any);
  };

  // 카카오 로그인 버튼 클릭 시
  const handleKakaoLogin = async () => {
    if (isLoginPending) return;

    setErrorMessage(null);

    if (!KAKAO_REST_API_KEY || !KAKAO_REDIRECT_URI) {
      setErrorMessage("카카오 로그인 환경변수를 확인해주세요.");
      return;
    }

    try {
      setIsOpeningBrowser(true);
      const appReturnUrl = Linking.createURL(
        Platform.OS === "android" ? "/onboarding/login" : "/auth/kakao",
      );
      const params = new URLSearchParams({
        response_type: "code",
        client_id: KAKAO_REST_API_KEY,
        redirect_uri: KAKAO_REDIRECT_URI,
        state: appReturnUrl,
        prompt: "select_account",
      });
      const authUrl = `${KAKAO_AUTH_URL}?${params.toString()}`;

      if (__DEV__) {
        console.log("[Kakao Login] kakaoRedirectUri:", KAKAO_REDIRECT_URI);
        console.log("[Kakao Login] appReturnUrl:", appReturnUrl);
      }

      if (Platform.OS === "android") {
        const result = await WebBrowser.openAuthSessionAsync(
          authUrl,
          appReturnUrl,
        );
        if (result.type !== "success") return;

        const kakaoError =
          getUrlParam(result.url, "error_description") ??
          getUrlParam(result.url, "error");
        if (kakaoError) {
          setErrorMessage(kakaoError);
          return;
        }

        const authorizationCode = getUrlParam(result.url, "code");
        if (!authorizationCode) {
          setErrorMessage("카카오 인가 코드를 가져오지 못했어요.");
          return;
        }

        const auth = await kakaoLoginMutation.mutateAsync({
          authorizationCode,
          redirectUri: KAKAO_REDIRECT_URI,
        });
        await finishLogin(auth);
        return;
      }

      await WebBrowser.openBrowserAsync(authUrl);
    } catch (error) {
      if (__DEV__) {
        console.log("[Kakao Login] failed:", error);
      }
      setErrorMessage("카카오 로그인에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsOpeningBrowser(false);
    }
  };

  const handleAppleLogin = async () => {
    if (isLoginPending) return;

    setErrorMessage(null);

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        setErrorMessage("Apple 로그인 정보를 가져오지 못했어요.");
        return;
      }

      if (!credential.authorizationCode) {
        setErrorMessage("Apple 인증 코드를 가져오지 못했어요.");
        return;
      }

      const auth = await appleLoginMutation.mutateAsync({
        identityToken: credential.identityToken,
        authorizationCode: credential.authorizationCode,
        email: credential.email,
        name: getAppleCredentialName(credential),
      });

      await finishLogin(auth);
    } catch (error) {
      if ((error as { code?: string }).code === "ERR_REQUEST_CANCELED") {
        return;
      }

      if (__DEV__) {
        console.log("[Apple Login] failed:", error);
      }
      setErrorMessage(getAppleLoginErrorMessage(error));
    }
  };

  // 이용약관 확인 후 → 앱 접근 권한 안내로 이동
  const handleTermsConfirm = () => {
    setShowTermsSheet(false);
    router.replace("/onboarding/permissions" as any);
  };

  const isLoginPending =
    isOpeningBrowser ||
    appleLoginMutation.isPending ||
    kakaoLoginMutation.isPending;

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
          accessibilityLabel="카카오 로그인"
        >
          <View style={styles.socialButtonContent}>
            <View style={styles.socialButtonIconBox}>
              <Image
                source={require("@/assets/images/kakao-login-symbol.png")}
                style={styles.kakaoSymbol}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.socialButtonText, styles.kakaoButtonText]}>
              카카오 로그인
            </Text>
          </View>
        </Pressable>
        {isAppleAuthAvailable ? (
          <Pressable
            style={({ pressed }) => [
              styles.socialButton,
              styles.appleButton,
              styles.appleLoginButton,
              isLoginPending && styles.socialButtonDisabled,
              pressed && !isLoginPending && styles.socialButtonPressed,
            ]}
            onPress={handleAppleLogin}
            disabled={isLoginPending}
            accessibilityRole="button"
            accessibilityLabel="Apple로 로그인"
          >
            <View style={styles.socialButtonContent}>
              <View style={styles.socialButtonIconBox}>
                <FontAwesome name="apple" size={30} color="#FFFFFF" />
              </View>
              <Text style={[styles.socialButtonText, styles.appleButtonText]}>
                Apple로 로그인
              </Text>
            </View>
          </Pressable>
        ) : null}
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
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
  socialButton: {
    width: "100%",
    maxWidth: 367,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
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
  appleLoginButton: {
    backgroundColor: "#000000",
  },
  socialButtonContent: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  socialButtonIconBox: {
    position: "absolute",
    left: 7,
    width: 44,
    height: "100%",
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
    width: 40,
    height: 40,
  },
  kakaoButtonText: {
    color: "rgba(0, 0, 0, 0.85)",
  },
  appleButtonText: {
    color: "#FFFFFF",
  },
  errorText: {
    marginTop: 12,
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});

function getAppleLoginErrorMessage(error: unknown) {
  const apiMessage = (error as {
    response?: { data?: { error?: { message?: string } } };
  }).response?.data?.error?.message;

  return apiMessage ?? "Apple 로그인에 실패했어요. 다시 시도해주세요.";
}

function getAppleCredentialName(
  credential: Awaited<ReturnType<typeof AppleAuthentication.signInAsync>>,
) {
  const formattedName = credential.fullName
    ? AppleAuthentication.formatFullName(credential.fullName).trim()
    : "";

  return formattedName || credential.email?.split("@")[0] || "Apple 사용자";
}
