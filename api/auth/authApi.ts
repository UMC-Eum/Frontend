//v1/auth/kakao/login
import { isAxiosError } from "axios";

import api from "../axiosInstance";
import { ApiFailResponse, ApiSuccessResponse } from "../../types/api/api";
import {
  IKakaoLoginRequest,
  IKakaoLoginResponse,
} from "../../types/api/auth/authDTO";

const normalizedBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(
  /\/+$/,
  "",
);

export const kakaoLogin = async (body: IKakaoLoginRequest) => {
  try {
    const { data } = await api.post<ApiSuccessResponse<IKakaoLoginResponse>>(
      "/v1/auth/kakao/login",
      body,
    );

    return data.success.data;
  } catch (error) {
    if (isAxiosError(error) && !error.response) {
      if (__DEV__) {
        console.log("[Kakao Login] axios network failed, retrying with fetch");
      }
      return kakaoLoginWithFetch(body);
    }

    throw error;
  }
};

async function kakaoLoginWithFetch(body: IKakaoLoginRequest) {
  if (!normalizedBaseUrl) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL is not configured.");
  }

  const response = await fetch(`${normalizedBaseUrl}/v1/auth/kakao/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as
    | ApiSuccessResponse<IKakaoLoginResponse>
    | ApiFailResponse;

  if (!response.ok || data.resultType === "FAIL") {
    throw new Error(data.error?.message ?? `카카오 로그인 실패: ${response.status}`);
  }

  return data.success.data;
}

//v1/auth/logout
export const logout = async () => {
  const { data } = await api.post<ApiSuccessResponse<null>>("/v1/auth/logout");

  return data.success.data;
};
