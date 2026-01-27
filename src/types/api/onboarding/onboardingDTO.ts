//v1/files/presign(post)
export interface IPresignRequest {
  fileName: string;
  contentType: string;
  purpose: string;
}
export interface IPresignResponse {
  data: {
    uploadUrl: string;
    fileUrl: string;
    expiresAt: string;
  };
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
  vibeVector: number[];
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
