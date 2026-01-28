import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUserStore } from "../stores/useUserStore";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const hasRequested = useRef(false);
  const { setIsLoggedIn } = useUserStore();

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

      console.log("백엔드로 보낼 데이터:", requestBody);
      console.log("🚀 현재 도메인:", window.location.origin);
      console.log("📡 환경변수 주소:", import.meta.env.VITE_REDIRECT_URL);

      axios
        .post(
          `${import.meta.env.VITE_API_BASE_URL}/v1/auth/kakao/login`,
          requestBody,
        )
        .then((res) => {
          console.log("🎉 로그인 성공!", res.data);

          // 안전하게 꺼내기 위해 옵셔널 체이닝(?.) 사용
          const loginData = res.data?.success?.data;
          const accessToken = loginData?.accessToken;
          const needsOnboarding = loginData?.onboardingRequired;

          if (accessToken) {
            // 1. 토큰 저장
            localStorage.setItem("accessToken", accessToken);
            console.log("✅ 토큰 저장 완료:", accessToken);

            // 2. 로그인 상태 설정
            setIsLoggedIn(true);
            console.log("✅ 로그인 상태 업데이트 완료");

            // 3. 페이지 이동 로직 (온보딩 필요하면 거기로 감)
            if (needsOnboarding) {
              navigate("/onboarding"); // 온보딩 페이지 경로가 맞는지 확인하세요!
            } else {
              navigate("/");
            }
          } else {
            console.error("🚨 토큰이 응답에 없습니다!");
            navigate("/login");
          }
        })
        .catch((err) => {
          console.error("😭 로그인 실패 원인:", err.response?.data || err);
          alert("로그인 실패! 관리자에게 문의하세요.");
          navigate("/login");
        });
    }
  }, [navigate, setIsLoggedIn]);

  return <div>로그인 처리 중입니다...</div>;
}
