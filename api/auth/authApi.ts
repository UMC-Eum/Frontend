//v1/auth/kakao/login
import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import {
  IAppleLoginRequest,
  IAppleLoginResponse,
  IEmailSendCodeRequest,
  IEmailSendCodeResponse,
  IEmailSignupRequest,
  IEmailSignupResponse,
  IEmailVerifyCodeRequest,
  IEmailVerifyCodeResponse,
  IKakaoLoginRequest,
  IKakaoLoginResponse,
  ILocalLoginRequest,
  ILocalLoginResponse,
  ITestAccountsResponse,
  ITestLoginRequest,
  ITestLoginResponse,
} from "../../types/api/auth/authDTO";

export const kakaoLogin = async (body: IKakaoLoginRequest) => {
  const { data } = await api.post<ApiSuccessResponse<IKakaoLoginResponse>>(
    "/v1/auth/kakao/login",
    body,
    { timeout: 15000 },
  );

  return data.success.data;
};

//v1/auth/apple/login
export const appleLogin = async (body: IAppleLoginRequest) => {
  const { data } = await api.post<ApiSuccessResponse<IAppleLoginResponse>>(
    "/v1/auth/apple/login",
    body,
  );

  return data.success.data;
};

//v1/auth/local/login (심사용 임시, EUM-191)
export const localLogin = async (body: ILocalLoginRequest) => {
  const { data } = await api.post<ApiSuccessResponse<ILocalLoginResponse>>(
    "/v1/auth/local/login",
    body,
  );

  return data.success.data;
};

//v1/auth/email/send-code (심사용 임시, EUM-191)
export const sendEmailCode = async (body: IEmailSendCodeRequest) => {
  const { data } = await api.post<ApiSuccessResponse<IEmailSendCodeResponse>>(
    "/v1/auth/email/send-code",
    body,
  );

  return data.success.data;
};

//v1/auth/email/verify-code (심사용 임시, EUM-191)
export const verifyEmailCode = async (body: IEmailVerifyCodeRequest) => {
  const { data } = await api.post<ApiSuccessResponse<IEmailVerifyCodeResponse>>(
    "/v1/auth/email/verify-code",
    body,
  );

  return data.success.data;
};

//v1/auth/email/signup (심사용 임시, EUM-191)
export const emailSignup = async (body: IEmailSignupRequest) => {
  const { data } = await api.post<ApiSuccessResponse<IEmailSignupResponse>>(
    "/v1/auth/email/signup",
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
