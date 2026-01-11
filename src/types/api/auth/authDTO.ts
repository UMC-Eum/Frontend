export interface IKakaoLoginRequest {
  authorizationCode: string;
  redirectUri: string;
}

export interface IKakaoLoginResponse {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  onboardingRequired: boolean;
  user: { userId: number; nickname: string | null };
}

export interface ITokenRefreshRequest {
  refreshToken: string;
}
export interface ITokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ILogoutRequest {
  refreshToken: string;
}
