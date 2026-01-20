import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";

interface KeywordsCandidate {
  text: string;
  score: number;
}
interface IVoiceAnalyzeRequest {
  audioUrl: string;
  language: "ko-KR";
}
interface IVoiceAnalyzeResponse {
  transcript: string;
  summary: string;
  keywordsCandidates: KeywordsCandidate[];
  vibeVector: number[];
}
export const postVoiceAnalyze = async (body: IVoiceAnalyzeRequest) => {
  const lambdaUrl = import.meta.env.VITE_VOICE_LAMBDA_URL;
  const { data } = await api.post<ApiSuccessResponse<IVoiceAnalyzeResponse>>(
    lambdaUrl,
    body,
  );

  return data.success.data;
};
