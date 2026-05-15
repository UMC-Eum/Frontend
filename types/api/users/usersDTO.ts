export interface IPatchUserProfileRequest {
  nickname?: string;
  gender?: "M" | "F";
  birthDate?: string;
  areaCode?: string;
  introText?: string;
  keywords?: string[];
  personalities?: string[];
  idealPersonalities?: string[];
  introAudioUrl?: string;
  profileImageUrl?: string;
}

export interface IKeywordsRequest {
  interestKeywordIds: number[];
}
export interface IPutIdealRequest {
  personalityKeywords: string[];
}

export interface IProfileVisitor {
  userId: number;
  nickname: string;
  age?: number;
  areaName?: string;
  profileImageUrl?: string | null;
  visitedAt?: string;
}

export interface IProfileVisitorsGetResponse {
  nextCursor: string | null;
  items: IProfileVisitor[];
}

export interface IIdealVoiceResponse {
  exists: boolean;
  introAudioUrl?: string | null;
  summary?: string | null;
  updatedAt?: string | null;
}

export interface INotificationSettingsResponse {
  enabled: boolean;
  heartEnabled?: boolean;
  chatEnabled?: boolean;
  clubEnabled?: boolean;
}

export interface INotificationSettingsPatchRequest {
  enabled?: boolean;
  heartEnabled?: boolean;
  chatEnabled?: boolean;
  clubEnabled?: boolean;
}

export interface ICreateProfileVisitResponse {
  visitId?: number;
  visitedAt?: string;
}
