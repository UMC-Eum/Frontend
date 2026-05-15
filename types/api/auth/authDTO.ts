export interface IKakaoLoginRequest {
  authorizationCode: string;
  redirectUri: string;
}

export interface IKakaoLoginResponse {
  accessToken: string;
  isNewUser: boolean;
  onboardingRequired: boolean;
  user: { userId: number; nickname: string | null };
}

export interface ITokenRefreshResponse {
  accessToken: string;
}
