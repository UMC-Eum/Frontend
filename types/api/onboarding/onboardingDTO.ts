//v1/files/presign(post)
export type PresignPurpose = "PROFILE_INTRO_AUDIO" | "PROFILE_IMAGE";

export interface IPresignRequest {
  fileName: string;
  contentType: string;
  purpose: PresignPurpose;
}
export interface IPresignResponse {
  uploadUrl: string;
  fileUrl: string;
  expiresAt: string;
}
//v1/onboarding/voice-profile/analyze(post)
export interface IPersonality {
  text: string;
  score: number;
}
export interface IInterest {
  text: string;
  score: number;
}
export interface IKeywordscandidate {
  personalities: IPersonality[];
  interests: IInterest[];
}
export interface IAnalyzeMatchedKeyword {
  category: string;
  id: number;
  keyword: string;
  score: number;
}
export interface IAnalyzeRequest {
  audioUrl: string;
  language: "ko-KR";
  analysisType: "profile" | "ideal-type";
  nickname: string;
  gender: "M" | "F";
  birthDate: string;
  areaCode: string;
}
export interface IAnalyzeResponse {
  userId?: number;
  transcript: string;
  summary: string;
  matchedKeywords?: IAnalyzeMatchedKeyword[];
  keywordCandidates?: IKeywordscandidate;
  vibeVector?: number[];
  profileCompleted?: boolean;
}
//v1/onboarding/profile(post)
export interface IProfileRequest {
  nickname: string;
  gender: "M" | "F";
  birthDate: string;
  areaCode: string;
  introText: string;
  introAudioUrl: string;
}
export interface IProfileResponse {
  userId: number;
  profileCompleted: boolean;
}
//v1/matches/recommendations(get)
export interface IItemRecommendation {
  userId: number;
  nickname: string;
  //profileImageUrl: string;//필요함
  //isHearted: boolean;//필요함
  age: number;
  areaName: string;
  keywords: string[];
  introText: string;
  introAudioUrl: string;
  profileImageUrl: string;
  matchScore: number;
  matchReasons: string[];
  isLiked: boolean;
  likedHeartId: number | null;
}
export interface IRecommendationsRequest {
  cursor?: string;
  size?: number;
}
export interface IRecommendationsResponse {
  nextCursor: string | null;
  items: IItemRecommendation[];
}
