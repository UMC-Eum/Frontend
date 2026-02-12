import axios from "axios";
import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import {
  IPresignRequest,
  IPresignResponse,
  IProfileRequest,
  IProfileResponse,
  IRecommendationsRequest,
  IRecommendationsResponse,
} from "../../types/api/onboarding/onboardingDTO";

// v1/files/presign (POST)
export const postPresign = async (body: IPresignRequest) => {
  const { data } = await api.post<ApiSuccessResponse<IPresignResponse>>(
    "/v1/files/presign",
    body,
  );

  return data.success.data;
};

//S3 Direct Upload (PUT)
export const uploadFileToS3 = async (uploadUrl: string, file: File) => {
  await axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": file.type,
    },
  });
};

// v1/onboarding/profile (POST)
export const postProfile = async (body: IProfileRequest) => {
  const { data } = await api.post<ApiSuccessResponse<IProfileResponse>>(
    "/v1/onboarding/profile",
    body,
  );

  return data.success.data;
};
//v1/matches/recommendation(get)
export const getRecommendations = async (body: IRecommendationsRequest) => {
  const { data } = await api.get<ApiSuccessResponse<IRecommendationsResponse>>(
    "/v1/matches/recommended",
    { params: body },
  );

  return data.success.data;
};

//v1/onboarding/ideal-personalities (PUT)
export const putIdealPersonalities = async (body: {
  personalityIds: string[];
}) => {
  const { data } = await api.put<ApiSuccessResponse<null>>(
    "/v1/onboarding/ideal-personalities",
    body,
  );

  return data.success.data;
};
