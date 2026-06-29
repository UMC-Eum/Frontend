import axios from "axios";

import { ApiSuccessResponse } from "../../types/api/api";
import {
  IAnalyzeRequest,
  IAnalyzeResponse,
} from "../../types/api/onboarding/onboardingDTO";
import { getAccessToken } from "../axiosInstance";

const VOICE_ANALYZE_URL =
  "https://syhvcjigrmajnvkdz56xensehq0ffrdz.lambda-url.ap-northeast-2.on.aws/";

export const postVoiceAnalyze = async (body: IAnalyzeRequest) => {
  const accessToken = getAccessToken();

  if (__DEV__) {
    console.log("[Voice Analyze API] POST lambda", {
      hasAccessToken: !!accessToken,
      analysisType: body.analysisType,
    });
  }

  const { data } = await axios.post<ApiSuccessResponse<IAnalyzeResponse>>(
    VOICE_ANALYZE_URL,
    body,
    {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    },
  );

  if (__DEV__) {
    console.log("[Voice Analyze API] success");
  }

  return data.success.data;
};
