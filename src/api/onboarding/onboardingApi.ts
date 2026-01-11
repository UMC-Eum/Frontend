import axios from "axios"; // S3 업로드용 (인터셉터 없는 순수 axios)
import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import {
  IPresignRequest,
  IPresignResponse,
  IAnalyzeRequest,
  IAnalyzeResponse,
  IProfileRequest,
  IProfileResponse,
  IRecommendationsResponse,
} from "../../types/api/onboarding/onboardingDTO";

// v1/files/presign (POST)
export const postPresign = async (body: IPresignRequest) => {
  const { data } = await api.post<ApiSuccessResponse<IPresignResponse>>(
    "/v1/files/presign",
    body
  );

  return data.success.data;
};

//!!!S3 Direct Upload (PUT)
export const uploadFileToS3 = async (uploadUrl: string, file: File) => {
  await axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": file.type, // Presign 요청때 보낸 타입과 일치해야 함
    },
  });
};

// v1/onboarding/voice-profile/analyze (POST)
export const postAnalyze = async (body: IAnalyzeRequest) => {
  const { data } = await api.post<ApiSuccessResponse<IAnalyzeResponse>>(
    "/v1/onboarding/voice-profile/analyze",
    body
  );

  return data.success.data;
};

// v1/onboarding/profile (POST)
export const postProfile = async (body: IProfileRequest) => {
  const { data } = await api.post<ApiSuccessResponse<IProfileResponse>>(
    "/v1/onboarding/profile",
    body
  );

  return data.success.data;
};
//v1/matches/recommendation(get)
export const getRecommendations = async () => {
  const { data } = await api.get<ApiSuccessResponse<IRecommendationsResponse>>(
    "/v1/matches/recommendations"
  );

  return data.success.data;
};
