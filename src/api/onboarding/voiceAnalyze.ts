import { ApiSuccessResponse } from "../../types/api/api";
import axios from "axios";

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
  const { data } = await axios.post<ApiSuccessResponse<IVoiceAnalyzeResponse>>(
    lambdaUrl,
    body,
  );

  return data.success.data;
};
