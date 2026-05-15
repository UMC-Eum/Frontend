import { ApiSuccessResponse } from "../../types/api/api";
import axios from "axios";
import {
  IAnalyzeRequest,
  IAnalyzeResponse,
} from "../../types/api/onboarding/onboardingDTO";

export const postVoiceAnalyze = async (body: IAnalyzeRequest) => {
  const lambdaUrl = process.env.EXPO_PUBLIC_VOICE_LAMBDA_URL;
  if (!lambdaUrl) {
    throw new Error("EXPO_PUBLIC_VOICE_LAMBDA_URL is not configured.");
  }

  const { data } = await axios.post<ApiSuccessResponse<IAnalyzeResponse>>(
    lambdaUrl,
    body,
  );

  return data.success.data;
};
