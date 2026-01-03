import loginbackground from "../../../assets/login_background.svg"
import kakaologin from "../../../assets/login_kakao.svg"


interface Props {
  onLoginSuccess: (user: { age: number; accessToken: string }) => void
}

export default function LoginStep({ onLoginSuccess }: Props) {
  const handleLogin = async () => {
    const response = {
      accessToken: "mock-kakao-token",
      age: 55,
    }

    onLoginSuccess(response)
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen px-6 bg-white">
      <img
        src={loginbackground}
        alt="illustration"
        className="mt-40 mb-2"
      />

      <h1 className="text-[32px] font-bold mb-2">
        사랑, 다시 이음으로
      </h1>

      <p className="text-[18px] mb-10 text-center">
        잊었던 설렘, 목소리로 다시 만나세요.
      </p>

      <img
      src={kakaologin}
      alt="loginbutton"
      className="mt-20 h-14 w-full"
      onClick={handleLogin}
      
       />
    </div>
  )
}
