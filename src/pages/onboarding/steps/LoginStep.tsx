import { useState, useEffect } from "react"; // 1. Hook 추가
import loginbackground from "../../../assets/login_background.svg";
import kakaologin from "../../../assets/login_kakao.svg";

export default function LoginStep() {
  const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_API_KEY;
  const REDIRECT_URL = `${window.location.origin}/oauth/callback/kakao`;

  // 2. 애니메이션 상태 관리
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트 후 아주 살짝 뒤에 애니메이션 시작 (즉시 실행되면 눈에 안 보일 수 있음)
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => {
    console.log("🔍 카카오로 보낼 Redirect URL:", REDIRECT_URL);
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URL)}&response_type=code`;

    window.location.href = kakaoAuthUrl;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 bg-white overflow-hidden">
      
      {/* 3. 일러스트 이미지: 서서히 나타남 (Fade In) + 살짝 커짐 */}
      <img 
        src={loginbackground} 
        alt="illustration" 
        className={`
          mb-2
          transition-all duration-1000 ease-out
          ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
        `} 
      />

      {/* 4. 텍스트 & 버튼 그룹: 일러스트보다 늦게 올라옴 (delay-300) */}
      <div className={`
        flex flex-col items-center w-full
        transition-all duration-1000 ease-out delay-300
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}>
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