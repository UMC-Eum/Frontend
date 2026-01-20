//v1/auth/kakao/login
import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import {
  IKakaoLoginRequest,
  IKakaoLoginResponse,
} from "../../types/api/auth/authDTO";

export const kakaoLogin = async (body: IKakaoLoginRequest) => {
  const { data } = await api.post<ApiSuccessResponse<IKakaoLoginResponse>>(
    "/auth/kakao/login",
    body,
  );

  return data.success.data;
};

//v1/auth/logout
export const logout = async () => {
  const { data } = await api.post<ApiSuccessResponse<null>>("/auth/logout");

  return data.success.data;
};
