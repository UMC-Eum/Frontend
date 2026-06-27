//v1/auth/kakao/login
import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import {
  IKakaoLoginRequest,
  IKakaoLoginResponse,
  ITestAccountsResponse,
  ITestLoginRequest,
  ITestLoginResponse,
} from "../../types/api/auth/authDTO";

export const kakaoLogin = async (body: IKakaoLoginRequest) => {
  const { data } = await api.post<ApiSuccessResponse<IKakaoLoginResponse>>(
    "/v1/auth/kakao/login",
    body,
  );

  return data.success.data;
};

//v1/auth/logout
export const logout = async () => {
  const { data } = await api.post<ApiSuccessResponse<null>>("/v1/auth/logout");

  return data.success.data;
};

//v1/auth/test-login
export const testLogin = async (body: ITestLoginRequest = {}) => {
  const { data } = await api.post<ApiSuccessResponse<ITestLoginResponse>>(
    "/v1/auth/test-login",
    body,
  );

  return data.success.data;
};

//v1/auth/test-accounts
export const getTestAccounts = async () => {
  const { data } = await api.get<ApiSuccessResponse<ITestAccountsResponse>>(
    "/v1/auth/test-accounts",
  );

  return data.success.data;
};
