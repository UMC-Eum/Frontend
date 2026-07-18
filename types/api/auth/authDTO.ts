export interface IKakaoLoginRequest {
  authorizationCode: string;
  redirectUri: string;
}

export interface IAppleLoginRequest {
  identityToken: string;
  authorizationCode: string;
  email: string | null;
  name: string;
}

export interface IKakaoLoginResponse {
  accessToken: string;
  isNewUser: boolean;
  onboardingRequired: boolean;
  user: { userId: number; nickname: string | null };
}

export type IAppleLoginResponse = IKakaoLoginResponse;

export interface ITokenRefreshResponse {
  accessToken: string;
}

// ponytail: 심사용 임시 로컬 로그인. 심사 종료 후 로컬 로그인 관련 코드 전체 제거 (EUM-191)
export interface ILocalLoginRequest {
  username: string;
  password: string;
}

export type ILocalLoginResponse = IKakaoLoginResponse;

export type ITestLoginRequest = Record<string, never>;
export type ITestLoginResponse = IKakaoLoginResponse;

export interface ITestAccountItem {
  [key: string]: unknown;
}

export interface ITestAccountsResponse {
  accounts: ITestAccountItem[];
}
