import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

import { kakaoLogin, logout } from "../../../api/auth/authApi";
import { IKakaoLoginResponse } from "../../../types/api/auth/authDTO";
import { ApiFailResponse } from "../../../types/api/api";

export const useAuth = () => {
  const navigate = useNavigate();

  /** 카카오 로그인 */
  const useKakaoLogin = () =>
    useMutation({
      mutationFn: kakaoLogin,

      onSuccess: (data: IKakaoLoginResponse) => {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        console.log("로그인 성공:", data.user);

        if (data.isNewUser || data.onboardingRequired) {
          navigate("/onboarding", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      },

      onError: (error) => {
        const axiosError = error as AxiosError<ApiFailResponse>;
        const responseData = axiosError.response?.data;

        if (responseData?.resultType === "FAIL") {
          const { code, message } = responseData.error;
          console.error(`[로그인 실패] ${code}: ${message}`);

          switch (code) {
            case "AUTH-001":
              alert(message);
              navigate("/login");
              break;

            default:
              alert(message);
              break;
          }
        } else {
          alert("서버와 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
        }
      },
    });

  /** 로그아웃 */
  const useLogout = () =>
    useMutation({
      mutationFn: logout,

      onSettled: () => {
        localStorage.clear();

        console.log("로그아웃 처리 완료");
        alert("로그아웃 되었습니다.");

        navigate("/login", { replace: true });
      },
    });

  return {
    useKakaoLogin,
    useLogout,
  };
};
