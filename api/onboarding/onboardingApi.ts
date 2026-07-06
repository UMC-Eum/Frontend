import api from "../axiosInstance";
import { ApiSuccessResponse } from "../../types/api/api";
import {
  IPresignApiData,
  IPresignRequest,
  IProfileRequest,
  IProfileResponse,
  IRecommendationsRequest,
  IRecommendationsResponse,
} from "../../types/api/onboarding/onboardingDTO";
import { normalizeS3ObjectRef } from "@/utils/s3ObjectRef";

// v1/files/presign (POST)
export const postPresign = async (body: IPresignRequest) => {
  const { data } = await api.post<ApiSuccessResponse<IPresignApiData>>(
    "/v1/files/presign",
    body,
  );
  const presignData = data.success.data.data;

  if (__DEV__) {
    console.log("[Presign] response data", {
      hasUploadUrl: !!presignData.uploadUrl,
      hasFileRef: !!presignData.fileRef,
      expiresAt: presignData.expiresAt,
    });
  }

  if (!presignData.uploadUrl || !presignData.fileRef) {
    throw new Error(
      `Presign response missing uploadUrl or fileRef: ${JSON.stringify(presignData)}`,
    );
  }

  return presignData;
};

type UploadableAudio = Blob & {
  type?: string;
};

//S3 Direct Upload (PUT)
export const uploadFileToS3 = async (
  uploadUrl: string,
  file: UploadableAudio,
  contentType = file.type || "audio/mp4",
) => {
  if (!uploadUrl) {
    throw new Error("S3 uploadUrl is empty.");
  }

  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => "");
    throw new Error(`S3 upload failed: ${response.status} ${responseText}`);
  }
};

// v1/onboarding/profile (POST)
export const postProfile = async (body: IProfileRequest) => {
  const { data } = await api.post<ApiSuccessResponse<IProfileResponse>>(
    "/v1/onboarding/profile",
    {
      ...body,
      introAudioUrl: normalizeS3ObjectRef(body.introAudioUrl),
    },
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
