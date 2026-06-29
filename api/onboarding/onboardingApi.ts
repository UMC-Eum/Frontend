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
  const presignData = normalizePresignResponse(data);

  if (__DEV__) {
    console.log("[Presign] response data", {
      hasUploadUrl: !!presignData.uploadUrl,
      hasFileUrl: !!presignData.fileUrl,
      expiresAt: presignData.expiresAt,
    });
  }

  if (!presignData.uploadUrl || !presignData.fileUrl) {
    throw new Error(
      `Presign response missing uploadUrl or fileUrl: ${JSON.stringify(presignData)}`,
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

type PresignResponseCandidate = {
  success?: { data?: Partial<IPresignResponse> | PresignResponseCandidate };
  data?: Partial<IPresignResponse> | PresignResponseCandidate;
  uploadUrl?: string;
  presignedUrl?: string;
  signedUrl?: string;
  url?: string;
  fileUrl?: string;
  publicUrl?: string;
  expiresAt?: string;
};

function normalizePresignResponse(
  response: ApiSuccessResponse<IPresignResponse> | PresignResponseCandidate,
): IPresignResponse {
  const candidate = response as PresignResponseCandidate;
  const payload = unwrapPresignPayload(
    candidate.success?.data ?? candidate.data ?? candidate,
  );
  const uploadUrl =
    payload.uploadUrl ??
    (payload as PresignResponseCandidate).presignedUrl ??
    (payload as PresignResponseCandidate).signedUrl ??
    (payload as PresignResponseCandidate).url ??
    "";
  const fileUrl =
    payload.fileUrl ?? (payload as PresignResponseCandidate).publicUrl ?? "";

  return {
    uploadUrl,
    fileUrl,
    expiresAt: payload.expiresAt ?? "",
  };
}

function unwrapPresignPayload(
  payload: Partial<IPresignResponse> | PresignResponseCandidate,
) {
  const candidate = payload as PresignResponseCandidate;

  return (candidate.success?.data ??
    candidate.data ??
    candidate) as Partial<IPresignResponse> & PresignResponseCandidate;
}

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
