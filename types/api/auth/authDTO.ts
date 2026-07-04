export interface IKakaoLoginRequest {
  authorizationCode: string;
  redirectUri: string;
}

export interface IAppleLoginRequest {
  identityToken: string;
  authorizationCode: string | null;
  email: string | null;
  fullName: {
    familyName: string | null;
    givenName: string | null;
    middleName: string | null;
    namePrefix: string | null;
    nameSuffix: string | null;
    nickname: string | null;
  } | null;
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

export type ITestLoginRequest = Record<string, never>;
export type ITestLoginResponse = IKakaoLoginResponse;

export interface ITestAccountItem {
  [key: string]: unknown;
}

export interface ITestAccountsResponse {
  accounts: ITestAccountItem[];
}
