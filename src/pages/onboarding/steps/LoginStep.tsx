import loginbackground from "../../../assets/login_background.svg";
import kakaologin from "../../../assets/login_kakao.svg";

export default function LoginStep() {
  const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_API_KEY;

  // 프론트엔드 콜백 URL (카카오가 사용자를 리다이렉트할 주소)
  const REDIRECT_URL = `${window.location.origin}/oauth/callback/kakao`;

  const handleLogin = () => {
    console.log("🔍 카카오로 보낼 Redirect URL:", REDIRECT_URL);
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URL)}&response_type=code`;

    window.location.href = kakaoAuthUrl;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen px-6 bg-white">
      <img src={loginbackground} alt="illustration" className="mt-40 mb-2" />

      <h1 className="text-[32px] font-bold mb-2">사랑, 다시 이음으로</h1>

      <p className="text-[18px] mb-10 text-center">
        잊었던 설렘, 목소리로 다시 만나세요.
      </p>

      {/* onClick에 handleLogin 연결 */}
      <img
        src={kakaologin}
        alt="loginbutton"
        className="mt-20 h-14 w-full cursor-pointer hover:opacity-90 transition-opacity"
        onClick={handleLogin}
      />
    </div>
  );
}
