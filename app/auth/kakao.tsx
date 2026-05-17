import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getAgreementStatus } from "@/api/agreements/agreementsApi";
import { KAKAO_REDIRECT_URI } from "@/constants/auth";
import { useKakaoLoginMutation } from "@/hooks/api/useAuth";

function getParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default function KakaoAuthCallbackScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    code?: string | string[];
    error?: string | string[];
    error_description?: string | string[];
  }>();
  const kakaoLoginMutation = useKakaoLoginMutation();
  const hasRequestedRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    WebBrowser.dismissBrowser().catch((error) => {
      if (__DEV__) {
        console.log("[Kakao Login] no browser to dismiss:", error);
      }
    });
  }, []);

  useEffect(() => {
    const loginWithKakaoCode = async () => {
      if (hasRequestedRef.current) return;
      hasRequestedRef.current = true;

      const kakaoError =
        getParamValue(params.error_description) ?? getParamValue(params.error);
      const authorizationCode = getParamValue(params.code);

      if (kakaoError) {
        setErrorMessage(kakaoError);
        return;
      }

      if (!authorizationCode) {
        setErrorMessage("카카오 인가 코드를 가져오지 못했어요.");
        return;
      }

      if (!KAKAO_REDIRECT_URI) {
        setErrorMessage("카카오 로그인 Redirect URI 환경변수를 확인해주세요.");
        return;
      }

      try {
        const auth = await kakaoLoginMutation.mutateAsync({
          authorizationCode,
          redirectUri: KAKAO_REDIRECT_URI,
        });

        const needsOnboarding = auth.onboardingRequired || auth.isNewUser;

        if (needsOnboarding) {
          const hasPassedAgreements = await getAgreementStatus();

          if (hasPassedAgreements) {
            router.replace("/onboarding/permissions" as any);
            return;
          }

          router.replace({
            pathname: "/onboarding/login",
            params: { showTerms: "1" },
          } as any);
          return;
        }

        router.replace("/home" as any);
      } catch (error) {
        if (__DEV__) {
          console.log("[Kakao Login] callback failed:", error);
        }
        setErrorMessage("카카오 로그인에 실패했어요. 다시 시도해주세요.");
      }
    };

    void loginWithKakaoCode();
  }, [
    kakaoLoginMutation,
    params.code,
    params.error,
    params.error_description,
    router,
  ]);

  const handleBackToLogin = () => {
    router.replace("/onboarding/login" as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      {errorMessage ? (
        <>
          <Text style={styles.title}>로그인에 실패했어요</Text>
          <Text style={styles.description}>{errorMessage}</Text>
          <Pressable style={styles.button} onPress={handleBackToLogin}>
            <Text style={styles.buttonText}>로그인으로 돌아가기</Text>
          </Pressable>
        </>
      ) : (
        <>
          <ActivityIndicator color="#FF3E70" />
          <Text style={styles.title}>카카오 로그인 중입니다</Text>
          <Text style={styles.description}>잠시만 기다려주세요.</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
  },
  title: {
    marginTop: 18,
    color: "#202020",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  description: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    textAlign: "center",
  },
  button: {
    marginTop: 24,
    height: 52,
    minWidth: 180,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#FF3E70",
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
