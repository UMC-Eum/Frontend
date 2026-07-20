import * as AppleAuthentication from "expo-apple-authentication";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

import { getAgreementStatus } from "@/api/agreements/agreementsApi";
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

/**
 * 카카오/Apple 소셜 로그인 공용 훅
 * - 로그인 성공 후 분기: 온보딩 필요 → 약관 통과 시 permissions, 미통과 시 onShowTerms / 완료 → 홈
 * - onShowTerms: 약관 동의가 필요할 때 화면별 처리(바텀시트 표시 또는 로그인 화면 이동)
 */
export function useSocialLogin({ onShowTerms }: { onShowTerms: () => void }) {
  const router = useRouter();
  const appleLoginMutation = useAppleLoginMutation();
  const kakaoLoginMutation = useKakaoLoginMutation();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOpeningBrowser, setIsOpeningBrowser] = useState(false);
  const [isAppleAuthAvailable, setIsAppleAuthAvailable] = useState(false);

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

  const isLoginPending =
    isOpeningBrowser ||
    appleLoginMutation.isPending ||
    kakaoLoginMutation.isPending;

  const finishLogin = async (auth: {
    isNewUser: boolean;
    onboardingRequired: boolean;
  }) => {
    const needsOnboarding = auth.onboardingRequired;

    if (needsOnboarding) {
      const hasPassedAgreements = await getAgreementStatus();

      if (hasPassedAgreements) {
        router.replace("/onboarding/permissions" as any);
        return;
      }

      onShowTerms();
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

  return {
    handleKakaoLogin,
    handleAppleLogin,
    isLoginPending,
    errorMessage,
    isAppleAuthAvailable,
  };
}
