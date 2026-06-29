import { ApiSuccessResponse } from "../../types/api/api";
import axios from "axios";
import { getAccessToken } from "../axiosInstance";
import {
  IAnalyzeRequest,
  IAnalyzeResponse,
} from "../../types/api/onboarding/onboardingDTO";

const VOICE_ANALYZE_LAMBDA_URL =
  "https://syhvcjigrmajnvkdz56xensehq0ffrdz.lambda-url.ap-northeast-2.on.aws/";

export const postVoiceAnalyze = async (body: IAnalyzeRequest) => {
  const token = getAccessToken();
  const { userId: _userId, ...analyzeBody } = body;
  const { data } = await axios.post<ApiSuccessResponse<IAnalyzeResponse>>(
    VOICE_ANALYZE_LAMBDA_URL,
    analyzeBody,
    {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );

  return data.success.data;
};
