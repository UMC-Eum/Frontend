//v1/files/presign(post)
export interface IPresignRequest {
  fileName: string;
  contentType: string;
  purpose: string;
}
export interface IPresignResponse {
  uploadUrl: string;
  fileUrl: string;
  expiresAt: string;
}
//v1/onboarding/voice-profile/analyze(post)
export interface IKeywordscandidate {
  text: string;
  score: number;
}
export interface IAnalyzeRequest {
  userId: number;
  audioUrl: string;
  language: "ko-KR";
}
export interface IAnalyzeResponse {
  transcript: string;
  summary: string;
  keywordsCandidates: IKeywordscandidate[];
}
//v1/onboarding/profile(post)
export interface IProfileRequest {
  nickname: string;
  gender: "M" | "F";
  birthDate: string;
  areaCode: string;
  introText: string;
  introAudioUrl: string;
  selectedKeywords: string[];
  customKeywords: string[];
}
export interface IProfileResponse {
  userId: number;
  profileCompleted: boolean;
}
//v1/matches/recommendations(get)
export interface IItemRecommendation {
  userId: number;
  nickname: string;
  age: number;
  areaName: string;
  keywords: string[];
  introText: string;
  introAudioUrl: string;
  matchScore: number;
  matchReasons: string[];
}
export interface IRecommendationsResponse {
  nextCursor: string | null;
  items: IItemRecommendation[];
}
