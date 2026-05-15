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
