import { ApiSuccessResponse } from "../../types/api/api";
import axios from "axios";
import {
  IInterest,
  IPersonality,
} from "../../types/api/onboarding/onboardingDTO";

interface KeywordCandidates {
  personalities: IPersonality[];
  interests: IInterest[];
}

interface IVoiceAnalyzeRequest {
  userId: number;
  audioUrl: string;
  language: "ko-KR";
  analysisType: "profile" | "ideal-type";
}

interface IVoiceAnalyzeResponse {
  transcript: string;
  summary: string;
  keywordCandidates: KeywordCandidates;
  vibeVector: number[];
}

export const postVoiceAnalyze = async (body: IVoiceAnalyzeRequest) => {
  const lambdaUrl = process.env.EXPO_PUBLIC_VOICE_LAMBDA_URL;
  if (!lambdaUrl) {
    throw new Error("EXPO_PUBLIC_VOICE_LAMBDA_URL is not configured.");
  }

  const { data } = await axios.post<ApiSuccessResponse<IVoiceAnalyzeResponse>>(
    lambdaUrl,
    body,
  );

  return data.success.data;
};
