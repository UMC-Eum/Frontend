import { useState, useEffect } from "react";
import loginbackground from "../../../assets/login_background.svg";
import kakaologin from "../../../assets/login_kakao.svg";

export default function LoginStep() {
  const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_API_KEY;
  const REDIRECT_URL = `${window.location.origin}/oauth/callback/kakao`;

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URL)}&response_type=code`;

    window.location.href = kakaoAuthUrl;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 bg-white overflow-hidden">
      <img
        src={loginbackground}
        alt="illustration"
        className={`
          mb-2
          transition-all duration-1000 ease-out
          ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
        `}
      />

      <div
        className={`
        flex flex-col items-center w-full
        transition-all duration-1000 ease-out delay-300
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}
      >
        <h1 className="text-[32px] font-bold mb-2">사랑, 다시 이음으로</h1>

        <p className="text-[18px] mb-10 text-center">
          잊었던 설렘, 목소리로 다시 만나세요.
        </p>

        <img
          src={kakaologin}
          alt="loginbutton"
          className="mt-20 h-14 w-full cursor-pointer"
          onClick={handleLogin}
        />
      </div>
    </div>
  );
}
