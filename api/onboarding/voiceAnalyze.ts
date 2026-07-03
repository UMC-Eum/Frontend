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
    nickname: body.nickname,
    gender: body.gender,
    birthDate: body.birthDate,
    areaCode: body.areaCode,
    introAudioUrl: body.audioUrl,
  };

  if (__DEV__) {
    console.log("[Voice Analyze API] POST /v1/onboarding/profile", {
      analysisType: body.analysisType,
      hasIntroAudioUrl: !!requestBody.introAudioUrl,
    });
    console.log("[Voice Analyze API] request body summary", {
      nickname: requestBody.nickname,
      gender: requestBody.gender,
      birthDate: requestBody.birthDate,
      areaCode: requestBody.areaCode,
      introAudioUrlLength: requestBody.introAudioUrl.length,
      introAudioUrlHead: requestBody.introAudioUrl.slice(0, 36),
    });
  }

  const { data } = await api.post<ApiSuccessResponse<IAnalyzeResponse>>(
    "/v1/onboarding/profile",
    requestBody,
  );
  const analyzeData = normalizeAnalyzeResponse(data);

  if (__DEV__) {
    console.log("[Voice Analyze API] success");
    console.log("[Voice Analyze API] response data", analyzeData);
  }

  return analyzeData;
};

function normalizeAnalyzeResponse(response: unknown): IAnalyzeResponse {
  const candidate = unwrapAnalyzePayload(response) as AnalyzeResponseCandidate;

  return ((
    candidate.analysisResult ??
    candidate.analysis ??
    candidate.profileAnalysis ??
    candidate.voiceAnalysis ??
    candidate
  ) as IAnalyzeResponse);
}

function unwrapAnalyzePayload(response: unknown) {
  const candidate = response as {
    success?: { data?: unknown };
    data?: unknown;
  };

  return candidate.success?.data ?? candidate.data ?? response;
}
