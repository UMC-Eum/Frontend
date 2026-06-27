import { ApiSuccessResponse } from "../../types/api/api";
import api from "../axiosInstance";
import {
  IAnalyzeRequest,
  IAnalyzeResponse,
} from "../../types/api/onboarding/onboardingDTO";

export const postVoiceAnalyze = async (body: IAnalyzeRequest) => {
  const { data } = await api.post<ApiSuccessResponse<IAnalyzeResponse>>(
    "/v1/onboarding/voice-profile/analyze",
    body,
  );

  return data.success.data;
};
