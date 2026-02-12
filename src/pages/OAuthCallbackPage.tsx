import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ApiSuccessResponse } from "../types/api/api";
import { IKakaoLoginResponse } from "../types/api/auth/authDTO";
import useCompleteLogin from "../hooks/useCompleteLogin";
import LoadingPage from "./LoadingPage";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const hasRequested = useRef(false);
  const { completeLogin } = useCompleteLogin();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const REDIRECT_URL = `${window.location.origin}/oauth/callback/kakao`;

    if (code && hasRequested.current === false) {
      hasRequested.current = true;

      const requestBody = {
        authorizationCode: code,
        redirectUri: REDIRECT_URL,
      };

      axios
        .post<ApiSuccessResponse<IKakaoLoginResponse>>(
          `${import.meta.env.VITE_API_BASE_URL}/v1/auth/kakao/login`,
          requestBody,
        )
        .then((res) => {
          const loginData = res.data?.success?.data;
          const accessToken = loginData?.accessToken;
          const needsOnboarding = loginData?.onboardingRequired;

          if (accessToken) {
            localStorage.setItem("accessToken", accessToken);

            completeLogin()
              .then(() => {
                if (needsOnboarding) {
                  navigate("/onboarding");
                } else {
                  navigate("/");
                }
              })
              .catch((err) => {
                console.error("로그인 완료 처리 실패:", err);
                alert("로그인 처리 중 문제가 발생했습니다. 다시 시도해주세요.");
                navigate("/login");
              });
          } else {
            console.error("토큰이 응답에 없습니다!");
            navigate("/login");
          }
        })
        .catch((err) => {
          console.error("로그인 실패 원인:", err.response?.data || err);
          alert("로그인 실패! 관리자에게 문의하세요.");
          navigate("/login");
        });
    }
  }, [navigate, completeLogin]);

  return <LoadingPage />;
}
