import { ApiSuccessResponse } from "../../types/api/api";
import {
  IAnalyzeRequest,
  IAnalyzeResponse,
} from "../../types/api/onboarding/onboardingDTO";
import api from "../axiosInstance";

type AnalyzeResponseCandidate = IAnalyzeResponse & {
  analysis?: IAnalyzeResponse;
  analysisResult?: IAnalyzeResponse;
  profileAnalysis?: IAnalyzeResponse;
  voiceAnalysis?: IAnalyzeResponse;
};

export const postVoiceAnalyze = async (body: IAnalyzeRequest) => {
  const requestBody = {
    nickname: "손성원",
    gender: "M",
    birthDate: "1900-01-01",
    areaCode: "2635000000",
    introAudioUrl: body.audioUrl,
  };

  if (__DEV__) {
    console.log("[Voice Analyze API] POST /v1/onboarding/profile", {
      hasIntroAudioUrl: !!requestBody.introAudioUrl,
    });
    console.log("[Voice Analyze API] request body", requestBody);
  }

  const { data } = await api.post<ApiSuccessResponse<IAnalyzeResponse>>(
    "/v1/onboarding/profile",
    requestBody,
  );

  if (__DEV__) {
    console.log("[Voice Analyze API] success");
    console.log("[Voice Analyze API] response data", data.success.data);
  }

  return normalizeAnalyzeResponse(data.success.data);
};

function normalizeAnalyzeResponse(data: IAnalyzeResponse) {
  const candidate = data as AnalyzeResponseCandidate;

  return (
    candidate.analysisResult ??
    candidate.analysis ??
    candidate.profileAnalysis ??
    candidate.voiceAnalysis ??
    candidate
  );
}
